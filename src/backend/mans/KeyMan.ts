import DBMan from './DBMan';
import Store from '../Store';
import { WalletKey } from '../lib/WalletKey';

class KeyMan {
  current: WalletKey;
  tmp?: WalletKey;

  async init() {
    const index = Store.get('keyIndex') || 1;

    const keys = await DBMan.accountRepo.find();
    const key = keys.find((k) => k.id === index) || keys[0];

    this.current = new WalletKey();
    await this.current.init(key);
  }

  
}

export default new KeyMan();
