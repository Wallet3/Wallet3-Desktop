import { IReactionDisposer, makeAutoObservable, reaction } from 'mobx';
import Messages, { IKey } from '../../common/Messages';

import App from '../App';
import DBMan from './DBMan';
import Store from '../Store';
import { WCMan } from './WCMan';
import { WalletKey } from '../lib/WalletKey';

class KeyMan {
  keys: WalletKey[] = [];

  current: WalletKey;
  tmp = new WalletKey();

  connections = new Map<number, { wcman: WCMan; disposer: IReactionDisposer }>();

  get overviewKeys(): IKey[] {
    return this.keys.map((k) => {
      const { wcman } = this.connections.get(k.id);

      return {
        name: k.name,
        id: k.id,
        addresses: k.addresses,
        authenticated: k.authenticated,
        connectedDApps: wcman.connectedSessions,
      };
    });
  }

  get currentId() {
    return this.current.id;
  }

  get currentWCMan() {
    return this.connections.get(this.currentId).wcman;
  }

  constructor() {
    makeAutoObservable(this);
  }

  async init() {
    this.keys = await Promise.all((await DBMan.accountRepo.find()).map((k) => new WalletKey().init(k)));
    const id = Store.get('keyId') || 1;

    await this.switch(id);

    console.log('wallet:', this.currentId, 'keys', this.keys.length);
  }

  async switch(id: number) {
    this.current = this.keys.find((k) => k.id === id) || this.keys[0];

    let { wcman, disposer } = this.connections.get(id) || {};
    if (!wcman) {
      wcman = new WCMan();
      await wcman.init(id);

      disposer = reaction(
        () => wcman.connectedSessions,
        () =>
          wcman.keyId === this.currentId
            ? App.mainWindow?.webContents.send(Messages.wcConnectsChanged, wcman.connectedSessions)
            : undefined
      );

      this.connections.set(id, { wcman, disposer });
    }

    App.mainWindow?.webContents.send(Messages.wcConnectsChanged, wcman.connectedSessions);

    Store.set('keyId', id);
  }

  finishTmp() {
    this.current = this.tmp;
    this.keys.push(this.current);
    this.tmp = new WalletKey();

    Store.set('keyId', this.currentId);
  }

  clean() {
    this.keys = [];
    this.current = undefined;
    this.init();

    this.connections.forEach((tuple) => {
      tuple.disposer();
    });

    Store.set('keyId', 1);
  }
}

export default new KeyMan();
