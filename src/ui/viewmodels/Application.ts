import MessageKeys, { AuthenticationResult, InitStatus, InitVerifyPassword, TxParams } from '../../common/Messages';
import { makeObservable, observable, runInAction } from 'mobx';

import WalletVM from './WalletVM';
import { createBrowserHistory } from 'history';
import crypto from '../bridges/Crypto';
import ipc from '../bridges/IPC';
import store from 'storejs';

export class Application {
  readonly history = createBrowserHistory();

  initVerified = false;
  hasMnemonic = false;
  touchIDSupported = false;

  constructor() {
    makeObservable(this, {});
  }

  async init(jump = true) {
    const { hasMnemonic, touchIDSupported, initVerified, addresses } = await ipc.invoke<InitStatus>(
      MessageKeys.getInitStatus
    );

    this.hasMnemonic = hasMnemonic;
    this.touchIDSupported = touchIDSupported;
    this.initVerified = initVerified;

    if (addresses?.length > 0) {
      WalletVM.initAccounts(addresses);
    }

    if (!jump) return;

    if (!hasMnemonic) {
      this.history.push('/welcome');
    } else {
      this.history.push(initVerified ? '/app' : '/locking');
    }
  }

  async verifyInitialization(passcode: string) {
    const password = crypto.sha256(passcode);
    const { addresses, verified } = await ipc.invokeSecure<InitVerifyPassword>(MessageKeys.initVerifyPassword, {
      password,
      count: 10,
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

  async promptTouchID(message?: string) {
    return await ipc.invokeSecure<boolean>(MessageKeys.promptTouchID, { message });
  }

  async auth() {
    const result = (await ipc.invokeSecure(MessageKeys.popupAuthentication, {})) as AuthenticationResult;
    return result;
  }

  clearHistory() {
    return ipc.invoke(MessageKeys.clearHistory);
  }

  scanQR() {
    return ipc.invoke(MessageKeys.scanQR);
  }

  connectWallet(uri: string) {
    return ipc.invokeSecure(MessageKeys.connectWallet, { uri, modal: true });
  }
}

export default new Application();
