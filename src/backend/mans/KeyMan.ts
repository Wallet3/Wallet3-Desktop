import { IReactionDisposer, autorun, makeAutoObservable, reaction, runInAction } from 'mobx';
import Messages, { IKey } from '../../common/Messages';

import App from '../App';
import DBMan from './DBMan';
import Store from '../Store';
import { WCMan } from './WCMan';
import { WalletKey } from '../lib/WalletKey';

class KeyMan {
  keys: WalletKey[] = [];

  current: WalletKey = null;
  tmpKey = new WalletKey();

  connections = new Map<number, { wcman: WCMan; disposer: IReactionDisposer }>();

  get overviewKeys(): IKey[] {
    return this.keys.map((k) => {
      const { wcman } = this.connections.get(k.id) || {};

      return {
        name: k.name,
        id: k.id,
        addresses: k.addresses,
        connectedDApps: wcman?.connectedSessions ?? [],
        type: k.type,
      };
    });
  }

  get currentId() {
    return this.current?.id ?? -1;
  }

  get currentWCMan() {
    return this.connections.get(this.currentId).wcman;
  }

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.keys.length,
      () => App.mainWindow?.webContents.send(Messages.keysChanged, JSON.stringify(this.overviewKeys))
    );

    reaction(
      () => this.current,
      () => {
        if (!this.current) return;

        App.mainWindow?.webContents.send(
          Messages.currentKeyChanged,
          JSON.stringify({ keys: this.overviewKeys, keyId: this.currentId })
        );
      }
    );
  }

  async init() {
    const keys = await Promise.all((await DBMan.accountRepo.find()).map((k) => new WalletKey().init(k)));
    const id = Store.get('keyId') || 1;

    if (keys.length === 0) return;

    await Promise.all(
      keys.map(async (key) => {
        const wcman = new WCMan(key);
        await wcman.init();

        const disposer = reaction(
          () => wcman.connectedSessions,
          () => App.mainWindow?.webContents.send(Messages.wcConnectsChanged(key.id), wcman.connectedSessions)
        );

        this.connections.set(key.id, { wcman, disposer });
      })
    );

    runInAction(() => {
      this.keys = keys;
      this.switch(id);
    });

    console.log('wallet:', this.current?.name, this.currentId, 'keys', this.keys.length);
  }

  async switch(id: number) {
    if (this.currentId === id) return this.currentId;

    this.current = this.keys.find((k) => k.id === id) || this.keys[0];
    id = this.current.id;

    let { wcman, disposer } = this.connections.get(id) || {};
    if (!wcman) {
      wcman = new WCMan(this.current);
      await wcman.init();

      disposer = reaction(
        () => wcman.connectedSessions,
        () => App.mainWindow?.webContents.send(Messages.wcConnectsChanged(id), wcman.connectedSessions)
      );

      this.connections.set(id, { wcman, disposer });
    }

    App.mainWindow?.webContents.send(Messages.wcConnectsChanged(id), wcman.connectedSessions);

    Store.set('keyId', id);

    return id;
  }

  async delete(keyId: number) {
    const key = this.keys.find((k) => k.id === keyId);
    if (!key) return false;

    const needSwitch = keyId === this.currentId;
    const index = this.keys.findIndex((k) => k.id === keyId);
    this.keys.splice(index, 1);

    if (needSwitch) this.switch(this.keys[0].id);

    const { disposer, wcman } = this.connections.get(keyId) || {};
    this.connections.delete(keyId);

    try {
      disposer?.();
      await Promise.all([wcman?.clean(), key.delete()]);
    } catch (error) {}

    return true;
  }

  async changeName(keyId: number, name: string) {
    const key = this.keys.find((k) => k.id === keyId);
    if (!key) return;

    await key.changeName(name);
  }

  async changePassword(keyId: number, authKey: string, newPassword: string, touchIDSupported = false) {
    const walletKey = this.keys.find((k) => k.id === keyId);
    if (!walletKey) return false;

    const oldPassword = walletKey.getAuthKeyPassword(authKey);

    const secret = await walletKey.readSecret(oldPassword);
    if (walletKey.checkSecretType(secret) === undefined) return false;

    walletKey.setTmpSecret(secret);
    await walletKey.savePassword(newPassword);
    if (!(await walletKey.saveSecret(newPassword))) return false;

    await walletKey.initLaunchKey();

    if (touchIDSupported) {
      await walletKey.encryptUserPassword(newPassword);
    }

    return true;
  }

  finishTmp() {
    console.log('finish tmpkey', this.tmpKey.id);
    this.keys.push(this.tmpKey);
    this.switch(this.tmpKey.id);

    this.tmpKey = new WalletKey();
  }

  async clean() {
    await Promise.all(this.keys.map((k) => k.delete()));

    runInAction(() => {
      this.keys = [];
      this.current = undefined;
    });

    this.connections.forEach((tuple) => {
      tuple.disposer?.();
      tuple.wcman?.clean();
    });

    Store.set('keyId', 1);
  }
}

export default new KeyMan();
