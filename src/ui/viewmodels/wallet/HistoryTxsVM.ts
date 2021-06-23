import { makeAutoObservable, runInAction } from 'mobx';

import { ITransaction } from '../../../backend/models/Transaction';
import Messages from '../../../common/Messages';
import ipc from '../../bridges/IPC';

export class HistoryTxsVM {
  txs: ITransaction[] = [];
  selectedTx: ITransaction = undefined;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchTxs() {
    const txs = await ipc.invoke<ITransaction[]>(Messages.getHistoryTxs);
    runInAction(() => (this.txs = txs));
  }

  selectTx(tx: ITransaction) {
    this.selectedTx = tx;
  }
}
