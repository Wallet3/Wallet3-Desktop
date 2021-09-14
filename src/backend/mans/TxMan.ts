import { FindManyOptions, IsNull, LessThanOrEqual } from 'typeorm';
import MessageKeys, { TxParams } from '../../common/Messages';
import { Notification, app, shell } from 'electron';
import { getTransactionReceipt, sendTransaction } from '../../common/Provider';
import { makeObservable, observable, runInAction } from 'mobx';

import DBMan from './DBMan';
import Transaction from '../models/Transaction';
import { convertTxToUrl } from '../../misc/Url';
import i18n from '../../i18n';
import { utils } from 'ethers';

class TxMan {
  private _timer: NodeJS.Timer;

  pendingTxs: Transaction[] = [];

  get txRepo() {
    return DBMan.txRepo;
  }

  constructor() {
    makeObservable(this, { pendingTxs: observable });
  }

  async init() {
    if (this._timer) return;

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
        title: tx.status ? i18n.t('Transaction Confirmed') : i18n.t('Transaction Failed'),
        body: i18n.t(tx.status ? 'TxConfirmed' : 'TxFailed', { nonce: tx.nonce }),
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

    const hasMainnetTxs = this.pendingTxs.some((t) => t.chainId === 1);
    this._timer = setTimeout(async () => await this.checkPendingTxs(), (hasMainnetTxs ? 10 : 3) * 1000);
  }

  async getHistoryTxs(from?: string) {
    return await this.findTxs({ where: [{ from }, { to: from }], order: { timestamp: 'DESC' }, take: 300 });
  }

  clean() {
    clearTimeout(this._timer);

    return new Promise<void>((resolve) => {
      runInAction(() => {
        this.pendingTxs = [];
        resolve();
      });
    });
  }

  sendTx = async (chainId: number, params: TxParams, txHex: string) => {
    const { result, error } = await sendTransaction(chainId, txHex);

    if (!result) {
      new Notification({
        title: i18n.t('Transaction Failed'),
        body: i18n.t('TxFailed2', { nonce: params.nonce, message: error?.message }),
      }).show();

      return undefined;
    }

    this.saveTx(params, txHex);
    
    return result;
  };

  saveTx = async (params: TxParams, txHex: string) => {
    const tx = utils.parseTransaction(txHex);

    if ((await this.findTxs({ where: { hash: tx.hash } })).length === 0) {
      const t = new Transaction();
      t.chainId = params.chainId;
      t.from = params.from;
      t.to = params.to;
      t.data = params.data;
      t.gas = params.gas;
      t.gasPrice = params.gasPrice || params.maxFeePerGas;
      t.tipPrice = params.maxPriorityFeePerGas || 0;
      t.hash = tx.hash;
      t.nonce = params.nonce;
      t.value = params.value;
      t.timestamp = Date.now();

      await this.save(t);
    }

    return tx;
  };
}

export default new TxMan();
