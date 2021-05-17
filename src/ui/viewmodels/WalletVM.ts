import Messages, { TxParams } from '../../common/Messages';
import NetVM, { Networks } from './NetworksVM';
import { makeAutoObservable, reaction, runInAction, when } from 'mobx';

import { AccountVM } from './AccountVM';
import ipc from '../bridges/IPC';

const Keys = {
  addressCount: 'AddressCount',
};

export class WalletVM {
  accounts: AccountVM[] = [];
  currentAccount: AccountVM = null;
  pendingTxs: TxParams[] = [];

  get accountIndex() {
    return this.accounts.indexOf(this.currentAccount);
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
      console.log('pending', content);
      try {
        runInAction(() => {
          // this.pendingTxs.push(...(JSON.parse(content) as TxParams[]));
          this.pendingTxs = JSON.parse(content);
        });
      } catch (error) {}
    });
  }

  initAccounts(addresses: string[]) {
    this.accounts = addresses.map((address) => new AccountVM({ address }));
    this.currentAccount = this.accounts[0];
    this.currentAccount?.refresh();
  }
}

export default new WalletVM();
