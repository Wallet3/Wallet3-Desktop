import * as Biometrics from './lib/Biometrics';
import * as Cipher from '../common/Cipher';

import { BrowserWindow, TouchBar, TouchBarButton, app, ipcMain } from 'electron';
import { DBMan, KeyMan, TxMan } from './mans';
import MessageKeys, {
  AuthenticationResult,
  ConfirmSendTx,
  InitStatus,
  PopupWindowTypes,
  SendTxParams,
} from '../common/Messages';
import { createECDH, createHash, randomBytes } from 'crypto';
import { makeObservable, observable, reaction, runInAction } from 'mobx';

// import BluetoothTransport from '@ledgerhq/hw-transport-node-ble';
import { Networks } from '../common/Networks';
import i18n from '../i18n';

declare const POPUP_WINDOW_WEBPACK_ENTRY: string;
declare const POPUP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export class App {
  touchIDSupported = false;
  bluetoothSupported = false;

  windows = new Map<string, { key: Buffer }>();
  mainWindow?: BrowserWindow;
  touchBarButtons?: { walletConnect: TouchBarButton; gas: TouchBarButton; price?: TouchBarButton };

  chainId = 1;
  machineId = 'default';

  get currentNetwork() {
    return Networks.find((n) => n.chainId === this.chainId);
  }

  get ready() {
    return KeyMan.keys.some((k) => k.addresses.length > 0);
  }

  get walletKey() {
    return KeyMan.current;
  }

  get tmpKey() {
    return KeyMan.tmpKey;
  }

  async init() {
    this.touchIDSupported = await Biometrics.isTouchIDSupported();
    // this.bluetoothSupported = await BluetoothTransport.isSupported();

    if (this.ready) return;

    reaction(
      () => TxMan.pendingTxs.length,
      () => this.mainWindow?.webContents.send(MessageKeys.pendingTxsChanged, [...TxMan.pendingTxs])
    );
  }

  constructor() {
    makeObservable(this, { chainId: observable });

    ipcMain.handle(MessageKeys.exchangeDHKey, (e, dh) => {
      const { rendererEcdhKey, windowId } = dh;

      const ecdh = createECDH('secp521r1');
      const mainEcdhKey = ecdh.generateKeys();

      const ipcSecureKey = ecdh.computeSecret(rendererEcdhKey);
      const iv = createHash('sha256').update(ipcSecureKey).digest().subarray(0, 16);
      const secret = { iv, key: ipcSecureKey };
      this.windows.set(windowId, secret);

      return mainEcdhKey;
    });

    ipcMain.handle(`${MessageKeys.getInitStatus}-secure`, async (e, _, winId) => {
      const { key } = this.windows.get(winId);

      return App.encryptIpc(
        {
          touchIDSupported: this.touchIDSupported,
          pendingTxs: [...TxMan.pendingTxs],
          platform: process.platform,
          keys: KeyMan.overviewKeys,
          currentKeyId: KeyMan.currentId,
          appVersion: app.getVersion(),
        } as InitStatus,
        key
      );
    });

    ipcMain.handle(MessageKeys.scanQR, async () => {
      if (!this.ready) return false;
      await this.createPopupWindow('scanQR', {}, { modal: true, parent: this.mainWindow });
    });

    ipcMain.handle(MessageKeys.clearHistory, () => {
      this.mainWindow?.webContents.clearHistory();
    });

    ipcMain.handle(`${MessageKeys.promptTouchID}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;
      const { message } = App.decryptIpc(cipherText, iv, key);

      if (!this.touchIDSupported) return App.encryptIpc({ success: false }, key);

      return App.encryptIpc({ success: await Biometrics.verifyTouchID(message ?? i18n.t('Unlock Wallet')) }, key);
    });

    ipcMain.handle(`${MessageKeys.genMnemonic}-secure`, (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;
      const { length } = App.decryptIpc(cipherText, iv, key);
      return App.encryptIpc(this.tmpKey.genMnemonic(length), key);
    });

    ipcMain.handle(`${MessageKeys.saveTmpSecret}-secure`, (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { secret } = App.decryptIpc(cipherText, iv, key);
      return App.encryptIpc({ success: this.tmpKey.setTmpSecret(secret) }, key);
    });

    ipcMain.handle(`${MessageKeys.setupMnemonic}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      if (this.tmpKey.hasSecret) return App.encryptIpc({ success: false }, key);

      const [iv, cipherText] = encrypted;
      const { password: userPassword } = App.decryptIpc(cipherText, iv, key);
      await DBMan.init();

      await this.tmpKey.savePassword(userPassword);
      if (!(await this.tmpKey.saveSecret(userPassword))) return App.encryptIpc({ success: false }, key);

      const addresses = await this.tmpKey.genAddresses(userPassword, 10);

      // TxNotification.watch(this.currentNetwork.defaultTokens, addresses, this.chainId);

      if (this.touchIDSupported) this.tmpKey.encryptUserPassword(userPassword);

      TxMan.init();
      KeyMan.finishTmp();

      return App.encryptIpc({ addresses, success: true }, key);
    });

    ipcMain.handle(`${MessageKeys.switchKey}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      let { keyId } = App.decryptIpc(cipherText, iv, key);
      keyId = await KeyMan.switch(keyId);

      return App.encryptIpc({ keyId }, key);
    });

    ipcMain.handle(`${MessageKeys.setDerivationPath}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { fullPath } = App.decryptIpc(cipherText, iv, key);
      await this.tmpKey.setFullPath(fullPath);
    });

    ipcMain.handle(`${MessageKeys.readSecret}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { authKey } = App.decryptIpc(cipherText, iv, key);
      const password = this.walletKey.getAuthKeyPassword(authKey);

      if (!password) {
        return App.encryptIpc({}, key);
      }

      const secret = await this.walletKey.readSecret(password);
      return App.encryptIpc({ secret }, key);
    });

    ipcMain.handle(`${MessageKeys.verifyPassword}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;
      const { password } = App.decryptIpc(cipherText, iv, key);
      const verified = await this.walletKey.verifyPassword(password);

      return App.encryptIpc({ success: verified }, key);
    });

    ipcMain.handle(`${MessageKeys.changePassword}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { authKey, newPassword, keyId } = App.decryptIpc(cipherText, iv, key);
      const success = await KeyMan.changePassword(keyId, authKey, newPassword, this.touchIDSupported);

      return App.encryptIpc({ success }, key);
    });

    ipcMain.handle(`${MessageKeys.initVerifyPassword}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { password, count } = App.decryptIpc(cipherText, iv, key);

      try {
        const addresses = (await this.walletKey.genAddresses(password, count)) || [];
        const verified = addresses.length > 0;

        if (verified) {
          setTimeout(() => this.mainWindow.webContents.send(MessageKeys.pendingTxsChanged, [...TxMan.pendingTxs]), 1000);
          if (this.touchIDSupported) await this.walletKey.encryptUserPassword(password);
        }

        // TxNotification.watch(this.currentNetwork.defaultTokens, addresses, this.chainId);

        return App.encryptIpc({ verified, addresses, keyId: this.walletKey.id }, key);
      } catch (error) {
        return App.encryptIpc({ verified: false, addresses: [] }, key);
      }
    });

    ipcMain.handle(`${MessageKeys.changeAccountIndex}-secure`, (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { index, keyId } = App.decryptIpc(cipherText, iv, key);

      KeyMan.keys.find((k) => k.id === keyId)?.changeAddressIndex(index);

      return App.encryptIpc({ success: true }, key);
    });

    ipcMain.handle(`${MessageKeys.releaseWindow}-secure`, (e, encrypted, winId) => {
      this.windows.delete(winId);
    });

    ipcMain.handle(`${MessageKeys.deleteKey}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { keyId } = App.decryptIpc(cipherText, iv, key);
      return App.encryptIpc({ success: await KeyMan.delete(keyId) }, key);
    });

    ipcMain.handle(`${MessageKeys.changeKeyName}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { keyId, name } = App.decryptIpc(cipherText, iv, key);
      KeyMan.changeName(keyId, name);
    });

    ipcMain.handle(`${MessageKeys.resetSystem}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { authKey } = App.decryptIpc(cipherText, iv, key);

      if (!this.walletKey.hasAuthKey(authKey) && authKey !== 'forgotpassword-reset') {
        return App.encryptIpc({ success: false }, key);
      }

      await Promise.all([TxMan.clean(), KeyMan.clean()]);
      await DBMan.clean();

      return App.encryptIpc({ success: true }, key);
    });

    ipcMain.handle(`${MessageKeys.changeChainId}`, async (e, id) =>
      runInAction(() => {
        this.chainId = id;
        // TxNotification.watch(this.currentNetwork.defaultTokens, KeyMan.current.addresses, id);
      })
    );

    ipcMain.handle(`${MessageKeys.sendTx}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const params: SendTxParams = App.decryptIpc(cipherText, iv, key);
      const password = await this.extractPassword(params);
      if (!password) return App.encryptIpc({}, key);

      const txHex = await this.walletKey.signTx(password, params);

      if (!txHex) {
        return App.encryptIpc({}, key);
      }

      TxMan.sendTx(params.chainId || this.chainId, params, txHex);

      return App.encryptIpc({ txHex }, key);
    });

    ipcMain.handle(MessageKeys.setLang, async (e, content) => {
      const { lang } = content;
      i18n.changeLanguage(lang);
    });

    ipcMain.handle(MessageKeys.getHistoryTxs, async () => {
      const txs = await TxMan.getHistoryTxs(this.walletKey.currentAddress);
      return [...txs];
    });

    this.initPopupHandlers();
  }

  static readonly decryptIpc = (encrypted: string, iv: Buffer | string, key: Buffer) => {
    const _iv = typeof iv === 'string' ? Buffer.from(iv, 'hex') : iv;
    const serialized = Cipher.decrypt(_iv, encrypted, key);
    return JSON.parse(serialized);
  };

  static readonly encryptIpc = (obj: any, key: Buffer) => {
    return Cipher.encrypt(JSON.stringify(obj), key);
  };

  extractPassword = async (params: SendTxParams) => {
    if (!this.ready) return '';

    if (params.from.toLowerCase() !== this.walletKey.currentAddress.toLowerCase()) {
      return '';
    }

    const password = params.viaTouchID ? await this.walletKey.decryptUserPassword() : params.password;
    return password;
  };

  initPopupHandlers = () => {
    ipcMain.handle(`${MessageKeys.createTransferTx}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const params: ConfirmSendTx = App.decryptIpc(cipherText, iv, key);
      const popup = await this.createPopupWindow('sendTx', params, {
        modal: true,
        parent: this.mainWindow,
        height: params.maxFeePerGas ? 375 : undefined,
      });

      await new Promise<boolean>((resolve) => {
        popup.once('close', () => resolve(true));
      });

      return App.encryptIpc({ success: true }, key);
    });

    ipcMain.handle(`${MessageKeys.connectWallet}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { uri, modal } = App.decryptIpc(cipherText, iv, key);
      if (!uri) return App.encryptIpc({ success: false }, key);

      const success = (await KeyMan.currentWCMan.connectAndWaitSession(uri, modal)) ? true : false;
      return App.encryptIpc({ success }, key);
    });

    ipcMain.handle(`${MessageKeys.popupAuthentication}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);

      const authId = randomBytes(4).toString('hex');
      this.createPopupWindow('auth', { authId }, { modal: true, parent: this.mainWindow });

      const result = await new Promise<AuthenticationResult>((resolve) => {
        ipcMain.handleOnce(`${MessageKeys.returnAuthenticationResult(authId)}-secure`, async (e, encrypted, popWinId) => {
          const { key } = this.windows.get(popWinId);
          const [iv, cipherText] = encrypted;

          const { success, password } = App.decryptIpc(cipherText, iv, key) as { success: boolean; password?: string };
          let authKey = '';
          if (success) {
            authKey = await this.walletKey.generateAuthKey(password, this.touchIDSupported);
          }

          resolve({ success, authKey });
        });
      });

      return App.encryptIpc(result, key);
    });

    ipcMain.handle(`${MessageKeys.popupMessageBox}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const params = App.decryptIpc(cipherText, iv, key);
      const approved = await this.ask(params);

      return App.encryptIpc({ approved }, key);
    });
  };

  async ask(args: { title: string; icon: string; message: string }) {
    const reqid = randomBytes(4).toString('hex');
    this.createPopupWindow('msgbox', { reqid, ...args }, { modal: true, parent: this.mainWindow, height: 250 });

    const approved = await new Promise<boolean>((resolve) => {
      ipcMain.handleOnce(`${MessageKeys.returnMsgBoxResult(reqid)}-secure`, async (e, encrypted, popWinId) => {
        const { key } = this.windows.get(popWinId);
        const [iv, cipherText] = encrypted;

        const { approved } = App.decryptIpc(cipherText, iv, key) as { approved: boolean };

        resolve(approved);
      });
    });

    return approved;
  }

  createPopupWindow(
    type: PopupWindowTypes,
    payload: any,
    windowArgs?: { modal?: boolean; parent?: BrowserWindow; height?: number; resizable?: boolean }
  ) {
    let { modal, parent, height, resizable } = windowArgs || {};

    height = height ?? (modal ? 333 : 320);
    const width = process.platform === 'darwin' ? 365 : 375;

    const popup = new BrowserWindow({
      width,
      minWidth: width,
      height,
      minHeight: height,
      maxWidth: process.platform === 'win32' ? width : undefined,
      maxHeight: process.platform === 'win32' ? height + 52 : undefined,
      modal,
      parent,
      resizable: resizable ?? true,
      show: false,
      frame: false,
      alwaysOnTop: true,
      acceptFirstMouse: true,
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
