import { makeAutoObservable, runInAction, when } from 'mobx';

import { AccountVM } from './AccountVM';
import App from './Application';
import MessageKeys from '../../common/Messages';
import ipc from '../bridges/IPC';
import store from 'storejs';

const Keys = {
  addressCount: 'AddressCount',
};

export class WalletVM {
  accounts: AccountVM[];
  currentAccount: AccountVM;

  get accountIndex() {
    return this.accounts.indexOf(this.currentAccount);
  }

  constructor() {
    makeAutoObservable(this);
  }

  initAccounts(addresses: string[]) {
    this.accounts = addresses.map((address) => new AccountVM({ address }));
    this.currentAccount = this.accounts[0];
    this.currentAccount?.refresh();
  }
}

export default new WalletVM();
