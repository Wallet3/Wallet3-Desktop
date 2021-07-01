import Application, { App } from '../App';
import { computed, makeObservable, observable, runInAction } from 'mobx';

import DBMan from './DBMan';
import Messages from '../../common/Messages';
import WCSession from '../models/WCSession';
import { WalletConnect } from '../lib/WalletConnect';
import { ipcMain } from 'electron';

class WCMan {
  private cache = new Set<string>();

  connects: WalletConnect[] = [];

  get connectedSessions() {
    return this.connects.map((c) => c.session);
  }

  constructor() {
    makeObservable(this, { connects: observable, connectedSessions: computed });

    ipcMain.handle(`${Messages.disconnectDApp}-secure`, (e, encrypted, winId) => {
      const { key } = Application.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { sessionKey } = App.decryptIpc(cipherText, iv, key);
      this.disconnect(sessionKey);
    });

    ipcMain.handle(`${Messages.switchDAppNetwork}-secure`, (e, encrypted, winId) => {
      const { key } = Application.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { chainId, sessionKey } = App.decryptIpc(cipherText, iv, key);
      return App.encryptIpc({ success: this.switchNetwork(sessionKey, chainId) }, key);
    });
  }

  async init() {
    if (!Application.walletKey) return;
    const sessions = await DBMan.wcsessionRepo.find({ where: { keyId: Application.walletKey.id } });
    this.recoverSessions(sessions);
  }

  async connectAndWaitSession(uri: string, modal = false) {
    if (this.cache.has(uri)) return undefined;

    const wc = new WalletConnect(modal);

    try {
      wc.connect(uri);
    } catch (error) {
      return undefined;
    }

    this.cache.add(uri);

    return await new Promise<WalletConnect>((resolve) => {
      const timer = setTimeout(() => rejectPromise(), 25000); // waiting for 25 seconds

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
        wcSession.lastUsedTimestamp = Date.now();
        wcSession.session = wc.session;
        wcSession.keyId = Application.walletKey.id || 0;

        wc.wcSession = wcSession;
        DBMan.wcsessionRepo.save(wcSession);

        this.handleWCEvents(wc);
        runInAction(() => this.connects.push(wc));
      });
    });
  }

  recoverSessions(wcSessions: WCSession[]) {
    const sessions: IWcSession[] = wcSessions.map((s) => s.session);

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
      const { wcSession, userChainId } = wc;
      wcSession.session = wc.session;
      wcSession.lastUsedTimestamp = Date.now();
      wcSession.userChainId = userChainId;
      wcSession.save();
    });
  }

  disconnect(key: string) {
    const target = this.connects.find((c) => c.session.key === key);
    if (!target) return;

    target.disconnect();
    target.dispose();
    target.wcSession.remove();
    runInAction(() => this.connects.splice(this.connects.indexOf(target), 1));
  }

  switchNetwork(sessionKey: string, toChainId: number) {
    const target = this.connects.find((c) => c.session.key === sessionKey);
    if (!target) return false;

    target.switchNetwork(toChainId);
    return true;
  }

  async clean() {
    this.connects.forEach((c) => c?.wcSession?.remove());
    await this.dispose();
  }

  dispose() {
    this.connects.forEach((c) => c?.dispose());
    this.cache.clear();

    return new Promise<void>((resolve) =>
      runInAction(() => {
        this.connects = [];
        resolve();
      })
    );
  }
}

export default new WCMan();
