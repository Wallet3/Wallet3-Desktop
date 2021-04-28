import { History, createBrowserHistory } from 'history';
import MessageKeys, { InitStatus } from '../../common/MessageKeys';
import { action, computed, flow, makeAutoObservable, makeObservable } from 'mobx';

import { ipcRenderer } from 'electron';

export class Application {
  readonly history = createBrowserHistory();

  hasMnemonic = false;
  touchIDSupported = false;

  constructor() {
    makeAutoObservable(this);
  }

  async init() {
    const { hasMnemonic, touchIDSupported }: InitStatus = await ipcRenderer.invoke(MessageKeys.getInitStatus);

    this.hasMnemonic = hasMnemonic;
    this.touchIDSupported = touchIDSupported;

    if (!hasMnemonic) {
      this.history.push('/welcome');
    }
  }
}

export default new Application();
