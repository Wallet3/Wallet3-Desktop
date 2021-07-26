import Application, { App } from '../App';
import { computed, makeObservable, observable, runInAction } from 'mobx';

import DBMan from './DBMan';
import Messages from '../../common/Messages';
import WCSession from '../models/WCSession';
import { WalletConnect } from '../lib/WalletConnect';
import { WalletKey } from '../lib/WalletKey';
import { ipcMain } from 'electron';
import isOnline from 'is-online';

export class WCMan {
  private cache = new Set<string>();
  private key: WalletKey;
  private reconnectingQueue: WCSession[] = [];
  private queueThreshold = 0;
  private reconnectTimer: NodeJS.Timer = undefined;

  connections: WalletConnect[] = [];

  get keyId() {
    return this.key.id;
  }

  get connectedSessions() {
    return this.connections.map((c) => c.session);
  }

  constructor(key: WalletKey) {
    this.key = key;

    makeObservable(this, { connections: observable, connectedSessions: computed });

    ipcMain.handle(`${Messages.disconnectDApp(this.keyId)}-secure`, (e, encrypted, winId) => {
      const { key } = Application.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { sessionKey } = App.decryptIpc(cipherText, iv, key);
      this.disconnect(sessionKey);
    });

    ipcMain.handle(`${Messages.switchDAppNetwork(this.keyId)}-secure`, (e, encrypted, winId) => {
      const { key } = Application.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { chainId, sessionKey } = App.decryptIpc(cipherText, iv, key);
      return App.encryptIpc({ success: this.switchNetwork(sessionKey, chainId) }, key);
    });
  }

  async init() {
    const sessions = await DBMan.wcsessionRepo.find({ where: { keyId: this.keyId } });
    this.queueThreshold = Math.min(Math.max(5, sessions.length), 32);
    this.recoverSessions(sessions);
  }

  async connectAndWaitSession(uri: string, modal = false) {
    if (!uri.startsWith('wc:') || !uri.includes('bridge=')) return undefined;
    if (this.cache.has(uri)) return undefined;
    if (!this.key.authenticated) return undefined;

    const wc = new WalletConnect({ modal, key: this.key });

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
        runInAction(() => this.connections.push(wc));
      });
    });
  }

  recoverSessions(wcSessions: WCSession[]) {
    const wcs = wcSessions.map((wcSession) => {
      const { session } = wcSession;

      if (this.cache.has(session.key)) return undefined;
      this.cache.add(session.key);

      const wc = new WalletConnect({ key: this.key });
      wc.connectViaSession(session);
      wc.wcSession = wcSession;

      this.handleWCEvents(wc);

      return wc;
    });

    runInAction(() => this.connections.push(...wcs.filter((i) => i)));
  }

  private handleWCEvents(wc: WalletConnect) {
    wc.once('disconnect', async () => {
      console.log('disconnect event');
      await wc.wcSession?.remove();
      wc.dispose();
      this.removeItem(wc);
    });

    wc.once('transport_error', () => {
      console.log('transport_error', wc.appMeta.name);

      const wcSession = wc.wcSession;
      wc.dispose();
      this.cache.delete(wcSession.session.key);
      this.removeItem(wc);

      this.queueDisconnectedSession(wcSession);
      this.handleReconnectingQueue();
    });

    wc.on('sessionUpdated', () => {
      const { wcSession, userChainId } = wc;
      wcSession.session = wc.session;
      wcSession.lastUsedTimestamp = Date.now();
      wcSession.userChainId = userChainId;
      wcSession.save();
    });
  }

  async disconnect(key: string) {
    console.log('disconnect', key);
    const target = this.connections.find((c) => c.session.key === key);
    if (!target) return;

    await target.disconnect();
    await target.wcSession.remove();

    target.dispose();
    this.removeItem(target);
  }

  removeItem(wcSession: WalletConnect) {
    const indexOf = this.connections.indexOf(wcSession);
    if (indexOf === -1) return;

    runInAction(() => this.connections.splice(indexOf, 1));
  }

  switchNetwork(sessionKey: string, toChainId: number) {
    const target = this.connections.find((c) => c.session.key === sessionKey);
    if (!target) return false;

    target.switchNetwork(toChainId);
    return true;
  }

  private queueDisconnectedSession(session: WCSession) {
    if (this.reconnectingQueue.length > this.queueThreshold) return; // too many re-connections after sleeping
    if (this.reconnectingQueue.find((i) => i.session.key === session.session.key)) return;

    this.reconnectingQueue.push(session);
  }

  private async handleReconnectingQueue() {
    if (this.reconnectTimer) return;

    if (!(await isOnline({ timeout: 5000 }))) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = undefined;
        this.handleReconnectingQueue();
      }, 2000);

      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;

      const item = this.reconnectingQueue.shift();
      if (!item) return;

      this.recoverSessions([item]);
      this.handleReconnectingQueue();
    }, 3000);
  }

  async clean() {
    await Promise.all(
      this.connections.map(async (c) => {
        await c?.wcSession?.remove();
        await c?.disconnect();
      })
    );

    ipcMain.removeAllListeners(`${Messages.disconnectDApp(this.keyId)}-secure`);
    ipcMain.removeAllListeners(`${Messages.switchDAppNetwork(this.keyId)}-secure`);

    await this.dispose();
  }

  dispose() {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;

    this.connections.forEach((c) => c?.dispose());
    this.cache.clear();
    this.reconnectingQueue = [];

    return new Promise<void>((resolve) =>
      runInAction(() => {
        this.connections = [];
        resolve();
      })
    );
  }
}
