import { makeAutoObservable, runInAction } from 'mobx';

import Messages from '../../../common/Messages';
import ipc from '../../bridges/IPC';

export class DAppVM {
  _session: IWcSession;
  userChainId: number = 0;

  constructor(session: IWcSession) {
    makeAutoObservable(this);
    this._session = session;
    this.userChainId = session.userChainId;
  }

  get appName() {
    return this._session.peerMeta.name;
  }

  get appDesc() {
    return this._session.peerMeta.description;
  }

  get appIcon() {
    return this._session.peerMeta.icons[0] || '';
  }

  get appUrl() {
    return this._session.peerMeta.url;
  }

  get lastUsedTimestamp() {
    return this._session.lastUsedTimestamp;
  }

  disconnect() {
    DAppVM.disconnect(this._session.key);
  }

  async switchNetwork(id: number) {
    await ipc.invokeSecure(Messages.switchDAppNetwork, { sessionKey: this._session.key, chainId: id });
    this._session.userChainId = id;

    runInAction(() => (this.userChainId = id));
  }

  static disconnect(sessionKey: string) {
    ipc.invokeSecure(Messages.disconnectDApp, { sessionKey });
  }
}
