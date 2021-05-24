import * as fs from 'fs';
import * as path from 'path';

import { Connection, FindManyOptions, IsNull, LessThanOrEqual, Repository, createConnection } from 'typeorm';
import { Notification, app, shell } from 'electron';
import { makeAutoObservable, runInAction } from 'mobx';

import Transaction from './models/Transaction';
import { convertTxToUrl } from '../misc/Url';
import { getTransactionReceipt } from '../common/Provider';

class TxMan {
  pendingTxs: Transaction[] = [];

  private connection: Connection;
  private txRepo: Repository<Transaction>;
  private _dbPath = '';
  private _timer: NodeJS.Timer;

  constructor() {
    makeAutoObservable(this);
  }

  async init() {
    if (this.connection) return;

    const userData = app.getPath('userData');
    const dbPath = path.join(userData, 'data/app.sqlite');
    this._dbPath = dbPath;

    this.connection = await createConnection({
      type: 'sqlite',
      database: dbPath,
      entities: [Transaction],
      synchronize: true,
      logging: false,
    });

    this.txRepo = this.connection.getRepository(Transaction);

    const pendingTxs = await this.findTxs({ where: { blockNumber: null } });
    runInAction(async () => this.pendingTxs.push(...pendingTxs));

    this.checkPendingTxs();
  }

  async findTxs(conditions: FindManyOptions<Transaction>) {
    return await this.txRepo.find(conditions);
  }

  async save(tx: Transaction) {
    if (!tx.blockNumber) {
      runInAction(() => this.pendingTxs.push(tx));
    }

    return await this.txRepo.save(tx);
  }

  private async checkPendingTxs() {
    const removeTxs: Transaction[] = [];

    for (let tx of this.pendingTxs) {
      const receipt = await getTransactionReceipt(tx.chainId, tx.hash);
      if (!receipt) {
        continue;
      }

      tx.gasUsed = Number.parseInt(receipt.gasUsed);
      tx.status = Number.parseInt(receipt.status) === 1;
      tx.transactionIndex = Number.parseInt(receipt.transactionIndex);
      tx.blockNumber = Number.parseInt(receipt.blockNumber);
      tx.blockHash = receipt.blockHash;
      await tx.save();
      removeTxs.push(tx);

      const notification = new Notification({
        title: tx.status ? 'Transaction Confirmed' : 'Transaction Failed',
        body: `Transaction ${tx.nonce} ${tx.status ? 'confirmed' : 'failed'}, view it on Etherscan`,
      }).once('click', () => {
        shell.openExternal(convertTxToUrl(tx));
      });

      notification.show();

      const invalidTxs = await this.findTxs({
        where: { chainId: tx.chainId, nonce: LessThanOrEqual(tx.nonce), blockNumber: IsNull() },
      });

      removeTxs.push(...invalidTxs);
      Promise.all(invalidTxs.map((t) => t.remove()));
    }

    runInAction(() => {
      for (let tx of removeTxs) {
        const index = this.pendingTxs.findIndex((t) => t.hash === tx.hash);
        if (index < 0) continue;
        this.pendingTxs.splice(index, 1);
      }
    });

    this._timer = setTimeout(async () => await this.checkPendingTxs(), 20 * 1000);
  }

  async clean() {
    clearTimeout(this._timer);
    await this.connection?.close();
    this.connection = undefined;
    fs.unlinkSync(this._dbPath);
  }
}

export default new TxMan();
