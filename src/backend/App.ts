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
  ipcSecureKey: Buffer;
  ipcSecureIv: Buffer;
  userPassword?: string; // keep password in memory for TouchID users

  constructor() {
    this.touchIDSupported = systemPreferences.canPromptTouchID();
    this.hasMnemonic = systemPreferences.getUserDefault(AppKeys.hasMnemonic, 'boolean');

    KeyMan.reset('');
    this.hasMnemonic = false;

    KeyMan.init();

    ipcMain.handleOnce(MessageKeys.exchangeDHKey, (e, dh) => {
      const { rendererEcdhKey, ipcSecureIv } = dh;
      this.ipcSecureIv = ipcSecureIv;

      const ecdh = createECDH('secp521r1');
      const mainEcdhKey = ecdh.generateKeys();

      this.ipcSecureKey = ecdh.computeSecret(rendererEcdhKey);
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

    ipcMain.handle(`${MessageKeys.genMnemonic}-secure`, (e, encrypted) => {
      const { length } = this.decryptIpc(encrypted);
      return this.encryptIpc(KeyMan.genMnemonic(length));
    });

    ipcMain.handle(`${MessageKeys.saveTmpMnemonic}-secure`, (e, encrypted) => {
      const { mnemonic } = this.decryptIpc(encrypted);
      KeyMan.setTmpMnemonic(mnemonic);
    });

    ipcMain.handle(`${MessageKeys.setupMnemonic}-secure`, async (e, encrypted) => {
      if (this.hasMnemonic) return this.encryptIpc({ success: false });

      const { password: userPassword } = this.decryptIpc(encrypted);

      await KeyMan.savePassword(userPassword);
      if (!(await KeyMan.saveMnemonic(userPassword))) return this.encryptIpc({ success: false });

      const addresses = await KeyMan.genAddresses(userPassword, 1);

      systemPreferences.setUserDefault(AppKeys.hasMnemonic, 'boolean', true as never);
      this.hasMnemonic = true;

      return this.encryptIpc({ addresses, success: true });
    });

    ipcMain.handle(`${MessageKeys.verifyPassword}-secure`, async (e, encrypted) => {
      const { password } = this.decryptIpc(encrypted);
      return this.encryptIpc(await KeyMan.verifyPassword(password));
    });

    ipcMain.handle(`${MessageKeys.initVerifyPassword}-secure`, async (e, encrypted) => {
      const { password, count } = this.decryptIpc(encrypted);
      const verified = await KeyMan.verifyPassword(password);
      const addresses: string[] = [];

      if (verified && this.touchIDSupported) {
        this.userPassword = password;
        addresses.push(...(await KeyMan.genAddresses(password, count)));
      }

      return this.encryptIpc({ verified, addresses });
    });

    ipcMain.handle(`${MessageKeys.fetchAddresses}-secure`, (e, encrypted) => {
      KeyMan;
    });
  }

  decryptIpc = (encrypted: string) => {
    const serialized = Cipher.decrypt(this.ipcSecureIv, encrypted, this.ipcSecureKey);
    return JSON.parse(serialized);
  };

  encryptIpc = (obj: any) => {
    return Cipher.encrypt(this.ipcSecureIv, JSON.stringify(obj), this.ipcSecureKey);
  };
}

export default new App();
