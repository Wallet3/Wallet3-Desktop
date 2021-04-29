import * as Cipher from './Cipher';
import * as keytar from 'keytar';

import { ipcMain, systemPreferences } from 'electron';

import KeyMan from './KeyMan';
import MessageKeys from '../common/IPCKeys';
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

    ipcMain.handle(MessageKeys.saveMnemonic, async (e, userPassword) => {
      if (this.hasMnemonic) return;

      await KeyMan.savePassword(userPassword);
      await KeyMan.saveMnemonic(userPassword);
      systemPreferences.setUserDefault(AppKeys.hasMnemonic, 'boolean', true as never);
      this.hasMnemonic = true;
    });
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
}

export default new App();
