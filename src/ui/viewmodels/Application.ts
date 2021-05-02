import { History, createBrowserHistory } from 'history';
import MessageKeys, { InitStatus, InitVerifyPassword } from '../../common/Messages';
import { action, computed, flow, makeAutoObservable, makeObservable, runInAction } from 'mobx';

import WalletVM from './WalletVM';
import crypto from '../ipc/Crypto';
import ipc from '../ipc/Bridge';
import store from 'storejs';

export class Application {
  readonly history = createBrowserHistory();

  initVerified = false;
  hasMnemonic = false;
  touchIDSupported = false;

  constructor() {
    makeAutoObservable(this);
  }

  async init() {
    const { hasMnemonic, touchIDSupported } = await ipc.invoke<InitStatus>(MessageKeys.getInitStatus);

    this.hasMnemonic = hasMnemonic;
    this.touchIDSupported = touchIDSupported;

    if (!hasMnemonic) {
      this.history.push('/welcome');
    } else {
      this.history.push('/locking');
    }
  }

  async verifyInitialization(passcode: string) {
    const password = crypto.sha256(passcode);
    const { addresses, verified } = await ipc.invokeSecure<InitVerifyPassword>(MessageKeys.initVerifyPassword, {
      password,
      count: store.get('AddressCount') || 1,
    });

    if (verified) {
      WalletVM.initAccounts(addresses);
    }

    return verified;
  }

  async verifyPassword(passcode: string) {
    const password = crypto.sha256(passcode);
    return await ipc.invokeSecure<boolean>(MessageKeys.verifyPassword, { password });
  }

  async promptTouchID() {
    return await ipc.invokeSecure<boolean>(MessageKeys.promptTouchID, {});
  }
}

export default new Application();
