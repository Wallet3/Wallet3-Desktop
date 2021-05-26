import { makeObservable, observable, runInAction } from 'mobx';

import DBMan from './DBMan';
import WCSession from './models/WCSession';
import { WalletConnect } from './WalletConnect';

class WCMan {
  private cache = new Set<string>();

  connects: WalletConnect[] = [];

  constructor() {
    makeObservable(this, { connects: observable });
  }

  async init() {
    this.connects = [];
    const sessions = await DBMan.wcsessionRepo.find();
    this.recoverSessions(sessions);
  }

  async connectAndWaitSession(uri: string, modal = false) {
    if (this.cache.has(uri)) return;

    const wc = new WalletConnect(modal);
    wc.connect(uri);
    this.cache.add(uri);

    return await new Promise<WalletConnect>((resolve) => {
      const timer = setTimeout(() => rejectPromise(), 15000); // waiting for 15 seconds

      const rejectPromise = () => {
        clearTimeout(timer);
        resolve(undefined);
        wc.dispose(); // uri is expired
      };

      wc.once('sessionRequest', () => {
        clearTimeout(timer);
        resolve(wc);
      });

      wc.once('sessionApproved', () => {
        const wcSession = new WCSession();
        wcSession.userChainId = wc.userChainId;
        wcSession.topicId = wc.session.handshakeTopic;
        wcSession.lastUsedTimestamp = Date.now();
        wcSession.session = JSON.stringify(wc.session);

        wc.wcSession = wcSession;
        DBMan.wcsessionRepo.save(wcSession);

        this.handleWCEvents(wc);
        runInAction(() => this.connects.push(wc));
      });
    });
  }

  recoverSessions(wcSessions: WCSession[]) {
    const sessions: IWcSession[] = wcSessions.map((s) => JSON.parse(s.session));

    const wcs = this.connectSessions(sessions);
    wcs.filter((i) => i).map((wc, i) => (wc.wcSession = wcSessions[i]));

    runInAction(() => this.connects.push(...wcs));
  }

  private connectSessions(sessions: IWcSession[]) {
    return sessions.map((session) => {
      if (this.cache.has(session.key)) return undefined;
      this.cache.add(session.key);

      const wc = new WalletConnect();
      wc.connectViaSession(session);
      this.handleWCEvents(wc);

      return wc;
    });
  }

  private handleWCEvents(wc: WalletConnect) {
    wc.once('disconnect', () => {
      wc.dispose();
      wc.wcSession?.remove({});
      runInAction(() => this.connects.splice(this.connects.indexOf(wc), 1));
    });

    wc.on('sessionUpdated', () => {
      const { wcSession } = wc;
      wcSession.session = JSON.stringify(wc.session);
      wcSession.lastUsedTimestamp = Date.now();
      wcSession.save();
    });
  }

  clean() {
    this.connects.forEach((c) => c.wcSession.remove());
    this.dispose();
  }

  dispose() {
    this.connects.forEach((c) => c.dispose());
  }
}

export default new WCMan();
