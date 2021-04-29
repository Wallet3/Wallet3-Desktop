import { History, createBrowserHistory } from 'history';
import MessageKeys, { InitStatus } from '../../common/IPC';
import { action, computed, flow, makeAutoObservable, makeObservable } from 'mobx';

import crypto from '../ipc/Crypto';
import ipc from '../ipc/Bridge';

export class Application {
  readonly history = createBrowserHistory();

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

  async verifyPassword(passcode: string) {
    const password = crypto.sha256(passcode);
    return await ipc.invokeSecure<boolean>(MessageKeys.verifyPassword, { password });
  }

  async promptTouchID() {
    return await ipc.invoke<boolean>(MessageKeys.promptTouchID);
  }
}

export default new Application();
