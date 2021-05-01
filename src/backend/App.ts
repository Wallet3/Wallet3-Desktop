import * as Cipher from '../common/Cipher';

import { ipcMain, systemPreferences } from 'electron';

import KeyMan from './KeyMan';
import MessageKeys from '../common/Messages';
import { createECDH } from 'crypto';

const AppKeys = {
  hasMnemonic: 'has-mnemonic',
};

class App {
  touchIDSupported = false;
  hasMnemonic = false;
  userPassword?: string; // keep password in memory for TouchID users
  ipcs = new Map<string, { iv: Buffer; key: Buffer }>();

  constructor() {
    this.touchIDSupported = systemPreferences.canPromptTouchID();
    this.hasMnemonic = systemPreferences.getUserDefault(AppKeys.hasMnemonic, 'boolean');

    // KeyMan.reset('');
    // this.hasMnemonic = false;

    KeyMan.init();

    ipcMain.handleOnce(MessageKeys.exchangeDHKey, (e, dh) => {
      const { rendererEcdhKey, ipcSecureIv, windowId } = dh;

      const ecdh = createECDH('secp521r1');
      const mainEcdhKey = ecdh.generateKeys();

      const ipcSecureKey = ecdh.computeSecret(rendererEcdhKey);
      const secret = { iv: ipcSecureIv, key: ipcSecureKey };
      this.ipcs.set(windowId, secret);

      return mainEcdhKey;
    });

    ipcMain.handle(MessageKeys.getInitStatus, () => {
      return { hasMnemonic: this.hasMnemonic, touchIDSupported: this.touchIDSupported };
    });

    ipcMain.handle(MessageKeys.promptTouchID, async () => {
      if (!this.touchIDSupported) return false;

      try {
        await systemPreferences.promptTouchID('Unlock Wallet');
        return true;
      } catch (error) {
        return false;
      }
    });

    ipcMain.handle(`${MessageKeys.genMnemonic}-secure`, (e, encrypted, winId) => {
      const { key, iv } = this.ipcs.get(winId);
      const { length } = this.decryptIpc(encrypted, iv, key);
      return this.encryptIpc(KeyMan.genMnemonic(length), iv, key);
    });

    ipcMain.handle(`${MessageKeys.saveTmpMnemonic}-secure`, (e, encrypted, winId) => {
      const { iv, key } = this.ipcs.get(winId);
      const { mnemonic } = this.decryptIpc(encrypted, iv, key);
      KeyMan.setTmpMnemonic(mnemonic);
    });

    ipcMain.handle(`${MessageKeys.setupMnemonic}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.ipcs.get(winId);
      if (this.hasMnemonic) return this.encryptIpc({ success: false }, iv, key);

      const { password: userPassword } = this.decryptIpc(encrypted, iv, key);

      await KeyMan.savePassword(userPassword);
      if (!(await KeyMan.saveMnemonic(userPassword))) return this.encryptIpc({ success: false }, iv, key);

      const addresses = await KeyMan.genAddresses(userPassword, 1);

      systemPreferences.setUserDefault(AppKeys.hasMnemonic, 'boolean', true as never);
      this.hasMnemonic = true;

      return this.encryptIpc({ addresses, success: true }, iv, key);
    });

    ipcMain.handle(`${MessageKeys.verifyPassword}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.ipcs.get(winId);
      const { password } = this.decryptIpc(encrypted, iv, key);
      return this.encryptIpc(await KeyMan.verifyPassword(password), iv, key);
    });

    ipcMain.handle(`${MessageKeys.initVerifyPassword}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.ipcs.get(winId);
      const { password, count } = this.decryptIpc(encrypted, iv, key);
      const verified = await KeyMan.verifyPassword(password);
      const addresses: string[] = [];

      if (verified && this.touchIDSupported) {
        this.userPassword = password;
        addresses.push(...(await KeyMan.genAddresses(password, count)));
      }

      return this.encryptIpc({ verified, addresses }, iv, key);
    });

    ipcMain.handle(`${MessageKeys.fetchAddresses}-secure`, (e, encrypted) => {
      KeyMan;
    });
  }

  decryptIpc = (encrypted: string, iv: Buffer, key: Buffer) => {
    const serialized = Cipher.decrypt(iv, encrypted, key);
    return JSON.parse(serialized);
  };

  encryptIpc = (obj: any, iv: Buffer, key: Buffer) => {
    return Cipher.encrypt(iv, JSON.stringify(obj), key);
  };
}

export default new App();
