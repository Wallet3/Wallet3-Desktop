import { makeAutoObservable, runInAction, when } from 'mobx';

import App from './Application';
import MessageKeys from '../../common/Messages';
import ipc from '../ipc/Bridge';
import store from 'storejs';

const Keys = {
  addressCount: 'AddressCount',
};

class WalletVM {
  addresses: string[];

  constructor() {
    makeAutoObservable(this);
  }

  fetchAddresses = async (password: string) => {
    const count = store.get(Keys.addressCount) || 1;
    const addrs = await ipc.invoke<string[]>(MessageKeys.fetchAddresses, { count });

    runInAction(() => (this.addresses = addrs));
  };
}
