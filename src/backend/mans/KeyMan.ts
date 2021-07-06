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
        authenticated: k.authenticated,
        connectedDApps: wcman?.connectedSessions ?? [],
      };
    });
  }

  get currentId() {
    return this.current?.id ?? 0;
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
        console.log('keyman current id changed');
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

    runInAction(() => {
      this.keys = keys;
      this.switch(id);
    });

    console.log('wallet:', this.current?.name, this.currentId, 'keys', this.keys.length);
  }

  async switch(id: number) {
    // if ()
    this.current = this.keys.find((k) => k.id === id) || this.keys[0];

    console.log(this.current['key']);

    let { wcman, disposer } = this.connections.get(this.currentId) || {};
    if (!wcman) {
      wcman = new WCMan(this.currentId);
      await wcman.init();

      disposer = reaction(
        () => wcman.connectedSessions,
        () =>
          wcman.keyId === this.currentId
            ? App.mainWindow?.webContents.send(Messages.wcConnectsChanged(this.currentId), wcman.connectedSessions)
            : undefined
      );

      this.connections.set(this.currentId, { wcman, disposer });
    }

    App.mainWindow?.webContents.send(Messages.wcConnectsChanged(this.currentId), wcman.connectedSessions);

    Store.set('keyId', this.currentId);

    console.log('switch:', id);

    return this.currentId;
  }

  finishTmp() {
    console.log('finish tmpkey', this.tmpKey.id);
    this.keys.push(this.tmpKey);
    this.switch(this.tmpKey.id);

    this.tmpKey = new WalletKey();
  }

  async clean(password: string, forgotPassword = false) {
    await Promise.all(this.keys.map((k) => k.reset(password, forgotPassword)));

    runInAction(() => {
      this.keys = [];
      this.current = undefined;
    });

    this.connections.forEach((tuple) => {
      tuple.disposer();
    });

    Store.set('keyId', 1);
  }
}

export default new KeyMan();
