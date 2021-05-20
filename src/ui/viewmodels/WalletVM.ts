import Messages, { TxParams } from '../../common/Messages';
import NetVM, { Networks } from './NetworksVM';
import { makeAutoObservable, reaction, runInAction, when } from 'mobx';

import { AccountVM } from './AccountVM';
import { PendingTxVM } from './PendingTxVM';
import ipc from '../bridges/IPC';

const Keys = {
  addressCount: 'AddressCount',
};

export class WalletVM {
  accounts: AccountVM[] = [];
  currentAccount: AccountVM = null;
  allPendingTxs: TxParams[] = [];

  get accountIndex() {
    return this.accounts.indexOf(this.currentAccount);
  }

  get pendingTxs() {
    return this.allPendingTxs.filter((tx) => tx.from === this.currentAccount.address);
  }

  get pendingTxCount() {
    return this.pendingTxs.length;
  }

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => NetVM.currentChainId,
      () => this.currentAccount?.refresh()
    );

    ipc.on(Messages.pendingTxsChanged, (e, content: string) => {
      runInAction(() => {
        try {
          this.allPendingTxs = JSON.parse(content);
        } catch (error) {}
      });
    });
  }

  initAccounts(addresses: string[]) {
    this.accounts = addresses.map((address) => new AccountVM({ address }));
    this.currentAccount = this.accounts[0];
    this.currentAccount?.refresh();
    setTimeout(() => this.refresh(), 30 * 1000);
  }

  refresh() {
    this.currentAccount?.refreshChainTokens();
    setTimeout(() => this.refresh(), 30 * 1000);
  }

  pendingTxVM: PendingTxVM = null;

  selectPendingTx(tx: TxParams) {
    this.pendingTxVM = new PendingTxVM(tx);
  }
}

export default new WalletVM();
