import * as Cipher from '../common/Cipher';
import * as keytar from 'keytar';

import { ipcMain, systemPreferences } from 'electron';

import KeyMan from './KeyMan';
import MessageKeys from '../common/IPC';
import { createECDH } from 'crypto';

const AppKeys = {
  hasMnemonic: 'has-mnemonic',
};

class App {
  touchIDSupported = false;
  hasMnemonic = false;
  ipcSecureKey: string;
  ipcSecureIv: Buffer;

  constructor() {
    this.touchIDSupported = systemPreferences.canPromptTouchID();
    this.hasMnemonic = systemPreferences.getUserDefault(AppKeys.hasMnemonic, 'boolean');

    ipcMain.handleOnce(MessageKeys.exchangeDHKey, (e, dh) => {
      const { rendererEcdhKey, ipcSecureIv } = dh;
      this.ipcSecureIv = ipcSecureIv;

      const ecdh = createECDH('secp521r1');
      const mainEcdhKey = ecdh.generateKeys();

      this.ipcSecureKey = ecdh.computeSecret(rendererEcdhKey).toString('hex');
      return mainEcdhKey;
    });

    ipcMain.handle(MessageKeys.getInitStatus, () => {
      return { hasMnemonic: this.hasMnemonic, touchIDSupported: this.touchIDSupported };
    });

    ipcMain.handle(MessageKeys.genMnemonic, (e, length) => {
      return KeyMan.genMnemonic(length);
    });

    ipcMain.handle(`${MessageKeys.genMnemonic}-secure`, (e, encrypted) => {
      const serialized = Cipher.decrypt(this.ipcSecureIv, encrypted, this.ipcSecureKey);
      const { length } = JSON.parse(serialized);

      return Cipher.encrypt(this.ipcSecureIv, JSON.stringify(KeyMan.genMnemonic(length)), this.ipcSecureKey);
    });

    ipcMain.handle(MessageKeys.saveMnemonic, async (e, userPassword) => {
      if (this.hasMnemonic) return false;

      await KeyMan.savePassword(userPassword);
      await KeyMan.saveMnemonic(userPassword);
      systemPreferences.setUserDefault(AppKeys.hasMnemonic, 'boolean', true as never);
      this.hasMnemonic = true;

      return true;
    });
  }
}

export default new App();
