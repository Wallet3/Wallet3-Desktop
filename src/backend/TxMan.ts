import * as path from 'path';

import { Connection, FindManyOptions, Repository, createConnection } from 'typeorm';
import { action, makeObservable, observable, runInAction } from 'mobx';

import Transaction from './models/Transaction';
import { app } from 'electron';
import { getTransactionReceipt } from '../common/Provider';

class TxMan {
  #connection: Connection;
  #txRepo: Repository<Transaction>;
  pendingTxs: Transaction[] = [];

  constructor() {
    makeObservable(this, { pendingTxs: observable, findTxs: action });
  }

  async init() {
    if (this.#connection) return;

    const userData = app.getPath('userData');
    const dbPath = path.join(userData, 'data/app.sqlite');

    this.#connection = await createConnection({
      type: 'sqlite',
      database: dbPath,
      entities: [Transaction],
      synchronize: true,
      logging: false,
    });

    this.#txRepo = this.#connection.getRepository(Transaction);

    this.pendingTxs.push(...(await this.findTxs({ where: { height: null } })));

    this.checkPendingTxs();
  }

  async findTxs(conditions: FindManyOptions<Transaction>) {
    return await this.#txRepo.find(conditions);
  }

  async save(tx: Transaction) {
    if (!tx.blockNumber) {
      this.pendingTxs.push(tx);
    }

    return await this.#txRepo.save(tx);
  }

  private async checkPendingTxs() {
    const removeTxs: Transaction[] = [];

    for (let tx of this.pendingTxs) {
      const receipt = await getTransactionReceipt(tx.chainId, tx.hash);
      if (!receipt) continue;

      tx.gasUsed = Number.parseInt(receipt.gasUsed);
      tx.status = Number.parseInt(receipt.status) === 1;
      tx.transactionIndex = Number.parseInt(receipt.transactionIndex);
      tx.blockNumber = Number.parseInt(receipt.blockNumber);
      tx.blockHash = receipt.blockHash;
      await tx.save();
      removeTxs.push(tx);
    }

    runInAction(() => {
      for (let tx of removeTxs) {
        this.pendingTxs.splice(this.pendingTxs.indexOf(tx), 1);
      }
    });

    setTimeout(async () => await this.checkPendingTxs(), 30 * 1000);
  }
}

export default new TxMan();
