export class DAppVM {
  _session: IWcSession;

  constructor(session: IWcSession) {
    this._session = session;
  }

  get chainId() {
    return this._session.chainId;
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

  disconnect() {}
}
