import NetVM, { Networks } from './NetworksVM';
import { makeAutoObservable, reaction, runInAction, when } from 'mobx';

import { AccountVM } from './AccountVM';

const Keys = {
  addressCount: 'AddressCount',
};

export class WalletVM {
  accounts: AccountVM[] = [];
  currentAccount: AccountVM = null;

  get accountIndex() {
    return this.accounts.indexOf(this.currentAccount);
  }

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => NetVM.currentChainId,
      () => this.currentAccount?.refresh()
    );
  }

  initAccounts(addresses: string[]) {
    this.accounts = addresses.map((address) => new AccountVM({ address }));
    this.currentAccount = this.accounts[0];
    this.currentAccount?.refresh();
  }
}

export default new WalletVM();
