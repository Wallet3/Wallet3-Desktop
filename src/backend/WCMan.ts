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

  async recoverSessions() {
    const sessions = await DBMan.wcsessionRepo.find();
    sessions.forEach((s) => this.recoverSession(s));
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

  connectSession(session: IWcSession) {
    if (this.cache.has(session.key)) return;
    this.cache.add(session.key);

    const wc = new WalletConnect();
    wc.connectViaSession(session);
    this.handleWCEvents(wc);

    runInAction(() => this.connects.push(wc));
    return wc;
  }

  recoverSession(wcSession: WCSession) {
    const session: IWcSession = JSON.parse(wcSession.session);

    const wc = this.connectSession(session);
    if (wc) wc.wcSession = wcSession;
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

  clean() {}
}

export default new WCMan();

export const testSession = {
  connected: true,
  accounts: ['0xaa94f8452a35743fb8F0B99b5222A6FDc350A924'],
  chainId: 42,
  bridge: 'https://bridge.walletconnect.org',
  key: '1f01772c7b76e0de659920f0b44de56b293fd2c1dca7a2890b03f7ad03935617',
  clientId: '207c7513-7bb7-40ad-8e05-7450452844f1',
  clientMeta: {
    name: 'Wallet 3',
    description: 'A secure desktop wallet for Bankless Era',
    icons: [],
    url: 'https://wallet3.io',
  },
  peerId: '44358115-e1d9-4307-9cd5-2e20afd74886',
  peerMeta: {
    description: '',
    url: 'https://example.walletconnect.org',
    icons: ['https://example.walletconnect.org/favicon.ico'],
    name: 'WalletConnect Example',
  },
  handshakeId: 1621931452514045,
  handshakeTopic: 'b31ca7ec-f164-4771-a5b3-2bd22549870d',
};
