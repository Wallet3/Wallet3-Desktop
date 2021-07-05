import DBMan from './DBMan';
import Store from '../Store';
import { WalletKey } from '../lib/WalletKey';
import { makeAutoObservable } from 'mobx';

class KeyMan {
  current: WalletKey;
  tmp = new WalletKey();
  keys: WalletKey[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  async init() {
    this.keys = await Promise.all((await DBMan.accountRepo.find()).map((k) => new WalletKey().init(k)));
    const id = Store.get('keyId') || 1;

    this.switch(id);
  }

  switch(id: number) {
    this.current = this.keys.find((k) => k.id === id) || this.keys[0];
  }

  finishTmp() {
    this.current = this.tmp;
    this.keys.push(this.current);
    this.tmp = new WalletKey();
  }

  clean() {
    this.keys = [];
    this.current = undefined;
    this.init();
  }
}

export default new KeyMan();
