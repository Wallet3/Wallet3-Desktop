import * as Cipher from './Cipher';
import * as crypto from 'crypto';
import * as keytar from 'keytar';

import { ipcMain, systemPreferences } from 'electron';

import KeyMan from './KeyMan';
import MessageKeys from '../common/MessageKeys';
import SecureEnclave from 'secure-enclave';
import { ethers } from 'ethers';

const AppKeys = {
  iv: 'iv',
  corePass: 'wallet3-master-password',
  lockPass: 'ui-lock-password',
  mnemonic: 'mnemonic',
  hasMnemonic: 'has-mnemonic',
  privkeys: 'privkeys',
  defaultAccount: 'master',
};

class App {
  iv!: string;
  corePass!: string;
  touchIDSupported = false;
  secureEnclaveSupported = false;
  hasMnemonic = false;

  constructor() {
    this.touchIDSupported = systemPreferences.canPromptTouchID();
    this.secureEnclaveSupported = SecureEnclave.isSupported;
    this.hasMnemonic = systemPreferences.getUserDefault(AppKeys.hasMnemonic, 'boolean');

    ipcMain.handle(MessageKeys.getInitStatus, () => {
      return { hasMnemonic: this.hasMnemonic, touchIDSupported: this.touchIDSupported };
    });

    ipcMain.handle(MessageKeys.genMnemonic, (e, length) => {
      return KeyMan.genMnemonic(length);
    });
  }

  async init() {
    this.iv = await keytar.getPassword(AppKeys.iv, AppKeys.defaultAccount);

    if (!this.iv) {
      this.iv = Cipher.generateIv().toString('hex');
      keytar.setPassword(AppKeys.iv, AppKeys.defaultAccount, this.iv);

      this.corePass = Cipher.generateIv(32).toString('hex');
      await keytar.setPassword(AppKeys.corePass, AppKeys.defaultAccount, this.corePass);
    } else {
      this.corePass = await this.getCorePassword('unlock wallet');
    }
  }

  async getCorePassword(reason: string) {
    if (this.touchIDSupported) {
      try {
        await systemPreferences.promptTouchID(reason);
      } catch (error) {
        return undefined;
      }
    }

    return await keytar.getPassword(AppKeys.corePass, AppKeys.defaultAccount);
  }

  get unlocked() {
    return this.iv && this.corePass;
  }
}

export default new App();
