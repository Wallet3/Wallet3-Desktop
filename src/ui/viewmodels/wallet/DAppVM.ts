import { makeAutoObservable, runInAction } from 'mobx';

import Messages from '../../../common/Messages';
import ipc from '../../bridges/IPC';

export class DAppVM {
  _session: IRawWcSession;
  userChainId: number = 0;
  keyId = -1;

  constructor(session: IRawWcSession, keyId: number) {
    makeAutoObservable(this);
    this.keyId = keyId;
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

  async switchNetwork(id: number) {
    await ipc.invokeSecure(Messages.switchDAppNetwork(this.keyId), { sessionKey: this._session.key, chainId: id });
    this._session.userChainId = id;

    runInAction(() => (this.userChainId = id));
  }

  disconnect() {
    DAppVM.disconnect(this._session.key, this.keyId);
  }

  static disconnect(sessionKey: string, keyId: number) {
    ipc.invokeSecure(Messages.disconnectDApp(keyId), { sessionKey });
  }
}
