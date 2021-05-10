import * as Cipher from '../common/Cipher';

import { BrowserWindow, TouchBar, TouchBarButton, app, ipcMain, systemPreferences } from 'electron';
import MessageKeys, { ConfirmSendTx, InitStatus, PopupWindowTypes, SendTxParams, TxParams } from '../common/Messages';
import { WalletConnect, connectAndWaitSession } from './WalletConnect';

import KeyMan from './KeyMan';
import { createECDH } from 'crypto';
import provider from '../common/Provider';

declare const POPUP_WINDOW_WEBPACK_ENTRY: string;
declare const POPUP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

class App {
  touchIDSupported = false;

  userPassword?: string; // keep password in memory for TouchID users
  windows = new Map<string, { iv: Buffer; key: Buffer }>();
  mainWindow?: BrowserWindow;
  touchBarButtons?: { walletConnect: TouchBarButton; gas: TouchBarButton; price?: TouchBarButton };
  currentAddressIndex = 0;
  addresses: string[] = [];
  chainId = 1;

  get currentAddress() {
    return this.addresses[this.currentAddressIndex];
  }

  constructor() {
    this.touchIDSupported = systemPreferences.canPromptTouchID();

    // KeyMan.reset('');
    KeyMan.init();

    ipcMain.handle(MessageKeys.exchangeDHKey, (e, dh) => {
      const { rendererEcdhKey, ipcSecureIv, windowId } = dh;

      const ecdh = createECDH('secp521r1');
      const mainEcdhKey = ecdh.generateKeys();

      const ipcSecureKey = ecdh.computeSecret(rendererEcdhKey);
      const secret = { iv: ipcSecureIv, key: ipcSecureKey };
      this.windows.set(windowId, secret);

      return mainEcdhKey;
    });

    ipcMain.handle(MessageKeys.getInitStatus, () => {
      return {
        hasMnemonic: KeyMan.hasMnemonic,
        touchIDSupported: this.touchIDSupported,
        initVerified: this.addresses.length > 0,
        addresses: this.addresses,
      } as InitStatus;
    });

    ipcMain.handle(MessageKeys.scanQR, () => {
      if (this.addresses.length === 0) return false;
      this.createPopupWindow('scanQR', {}, true, this.mainWindow);
      return true;
    });

    ipcMain.handle(MessageKeys.clearHistory, () => {
      this.mainWindow?.webContents.clearHistory();
    });

    ipcMain.handle(`${MessageKeys.promptTouchID}-secure`, async (e, encrypted, winId) => {
      if (!this.touchIDSupported) return false;

      const { iv, key } = this.windows.get(winId);
      const { message } = this.decryptIpc(encrypted, iv, key);

      try {
        await systemPreferences.promptTouchID(message ?? 'Unlock Wallet');
        return this.encryptIpc(true, iv, key);
      } catch (error) {
        return this.encryptIpc(false, iv, key);
      }
    });

    ipcMain.handle(`${MessageKeys.genMnemonic}-secure`, (e, encrypted, winId) => {
      const { key, iv } = this.windows.get(winId);
      const { length } = this.decryptIpc(encrypted, iv, key);
      return this.encryptIpc(KeyMan.genMnemonic(length), iv, key);
    });

    ipcMain.handle(`${MessageKeys.saveTmpMnemonic}-secure`, (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { mnemonic } = this.decryptIpc(encrypted, iv, key);
      KeyMan.setTmpMnemonic(mnemonic);
    });

    ipcMain.handle(`${MessageKeys.setupMnemonic}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      if (KeyMan.hasMnemonic) return this.encryptIpc({ success: false }, iv, key);

      const { password: userPassword } = this.decryptIpc(encrypted, iv, key);

      await KeyMan.savePassword(userPassword);
      if (!(await KeyMan.saveMnemonic(userPassword))) return this.encryptIpc({ success: false }, iv, key);

      const addresses = await KeyMan.genAddresses(userPassword, 1);
      this.addresses = addresses;
      if (this.touchBarButtons?.walletConnect) this.touchBarButtons.walletConnect.enabled = true;

      return this.encryptIpc({ addresses, success: true }, iv, key);
    });

    ipcMain.handle(`${MessageKeys.setDerivationPath}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { fullPath } = this.decryptIpc(encrypted, iv, key);
      await KeyMan.setFullPath(fullPath);
    });

    ipcMain.handle(`${MessageKeys.verifyPassword}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { password } = this.decryptIpc(encrypted, iv, key);
      return this.encryptIpc(await KeyMan.verifyPassword(password), iv, key);
    });

    ipcMain.handle(`${MessageKeys.initVerifyPassword}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { password, count } = this.decryptIpc(encrypted, iv, key);
      const verified = await KeyMan.verifyPassword(password);

      if (verified) {
        this.addresses.push(...(await KeyMan.genAddresses(password, count)));
        if (this.touchBarButtons?.walletConnect) this.touchBarButtons.walletConnect.enabled = true;

        if (this.touchIDSupported) {
          this.userPassword = password;
        }
      }

      return this.encryptIpc({ verified, addresses: verified ? this.addresses : [] }, iv, key);
    });

    ipcMain.handle(`${MessageKeys.releaseWindow}-secure`, (e, encrypted, winId) => {
      this.windows.delete(winId);
    });

    ipcMain.handle(`${MessageKeys.fetchAddresses}-secure`, (e, encrypted) => {
      KeyMan;
    });

    ipcMain.handle(`${MessageKeys.sendTx}-secure`, (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const params = this.decryptIpc(encrypted, iv, key) as SendTxParams;
      KeyMan;
    });

    this.initPopupHandlers();
  }

  decryptIpc = (encrypted: string, iv: Buffer, key: Buffer) => {
    const serialized = Cipher.decrypt(iv, encrypted, key);
    return JSON.parse(serialized);
  };

  encryptIpc = (obj: any, iv: Buffer, key: Buffer) => {
    return Cipher.encrypt(iv, JSON.stringify(obj), key);
  };

  initPopupHandlers = () => {
    ipcMain.handle(`${MessageKeys.createTransferTx}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const params: ConfirmSendTx = this.decryptIpc(encrypted, iv, key);
      const popup = await this.createPopupWindow('sendTx', params, true, this.mainWindow);

      await new Promise<boolean>((resolve) => {
        popup.once('close', () => resolve(true));
      });

      return this.encryptIpc(true, iv, key);
    });

    ipcMain.handle(`${MessageKeys.connectWallet}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { uri } = this.decryptIpc(encrypted, iv, key);
      if (!uri) return;

      return this.encryptIpc((await connectAndWaitSession(uri)) ? true : false, iv, key);
    });
  };

  createPopupWindow(type: PopupWindowTypes, payload: any, modal = false, parent?: BrowserWindow) {
    const height = modal ? 340 : 315;
    const popup = new BrowserWindow({
      width: 360,
      minWidth: 360,
      height,
      minHeight: height,
      modal,
      parent,
      show: false,
      frame: false,
      alwaysOnTop: true,
      webPreferences: {
        preload: POPUP_WINDOW_PRELOAD_WEBPACK_ENTRY,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
      },
    });

    if (this.touchBarButtons) {
      const { gas, price } = this.touchBarButtons || {};
      popup.setTouchBar(new TouchBar({ items: [price, gas] }));
    }

    popup.loadURL(POPUP_WINDOW_WEBPACK_ENTRY);
    popup.once('ready-to-show', () => popup.show());

    return new Promise<BrowserWindow>((resolve) => {
      popup.webContents.once('did-finish-load', () => {
        popup.webContents.send(MessageKeys.initWindowType, { type, payload });
        resolve(popup);
      });
    });
  }
}

export default new App();
