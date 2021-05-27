import * as Cipher from '../common/Cipher';

import { BrowserWindow, Notification, TouchBar, TouchBarButton, ipcMain, systemPreferences } from 'electron';
import MessageKeys, {
  AuthenticationResult,
  ConfirmSendTx,
  InitStatus,
  PopupWindowTypes,
  SendTxParams,
  TxParams,
} from '../common/Messages';
import { autorun, computed, makeObservable, observable, runInAction } from 'mobx';
import { createECDH, createHash, randomBytes } from 'crypto';
import { getProviderByChainId, sendTransaction } from '../common/Provider';

import DBMan from './DBMan';
import KeyMan from './KeyMan';
import Transaction from './models/Transaction';
import TxMan from './TxMan';
import WCMan from './WCMan';
import i18n from '../i18n';
import { utils } from 'ethers';

declare const POPUP_WINDOW_WEBPACK_ENTRY: string;
declare const POPUP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export class App {
  touchIDSupported = systemPreferences.canPromptTouchID();

  userPassword?: string; // keep password in memory for TouchID users
  windows = new Map<string, { iv: Buffer; key: Buffer }>();
  mainWindow?: BrowserWindow;
  touchBarButtons?: { walletConnect: TouchBarButton; gas: TouchBarButton; price?: TouchBarButton };
  private authKeys = new Map<string, string>();

  authExpired = false;
  currentAddressIndex = 0;
  addresses: string[] = [];
  chainId = 1;

  get chainProvider() {
    return getProviderByChainId(this.chainId);
  }

  get currentAddress() {
    return this.addresses[this.currentAddressIndex];
  }

  get ready() {
    return this.addresses.length > 0;
  }

  init() {
    autorun(() => {
      console.log('pending', TxMan.pendingTxs.length);
      this.mainWindow?.webContents.send(MessageKeys.pendingTxsChanged, JSON.stringify(TxMan.pendingTxs));
    });

    autorun(() => {
      console.log('wc connects', WCMan.connects.length);
      this.mainWindow?.webContents.send(
        MessageKeys.wcConnectsChanged,
        WCMan.connects.filter((i) => i).map((wc) => wc.session)
      );
    });
  }

  constructor() {
    makeObservable(this, {
      addresses: observable,
      chainId: observable,
      currentAddressIndex: observable,
      chainProvider: computed,
      currentAddress: computed,
    });

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

    ipcMain.handle(`${MessageKeys.getInitStatus}-secure`, (e, _, winId) => {
      const { iv, key } = this.windows.get(winId);

      return App.encryptIpc(
        {
          hasMnemonic: KeyMan.hasMnemonic,
          touchIDSupported: this.touchIDSupported,
          appAuthenticated: this.addresses.length > 0,
          authExpired: this.authExpired,
          addresses: [...this.addresses],
        } as InitStatus,
        iv,
        key
      );
    });

    ipcMain.handle(MessageKeys.scanQR, () => {
      if (this.addresses.length === 0) return false;
      this.createPopupWindow('scanQR', {}, { modal: true, parent: this.mainWindow });
      return true;
    });

    ipcMain.handle(MessageKeys.clearHistory, () => {
      this.mainWindow?.webContents.clearHistory();
    });

    ipcMain.handle(`${MessageKeys.promptTouchID}-secure`, async (e, encrypted, winId) => {
      if (!this.touchIDSupported) return false;

      const { iv, key } = this.windows.get(winId);
      const { message } = App.decryptIpc(encrypted, iv, key);

      try {
        await systemPreferences.promptTouchID(message ?? 'Unlock Wallet');
        return App.encryptIpc(true, iv, key);
      } catch (error) {
        return App.encryptIpc(false, iv, key);
      }
    });

    ipcMain.handle(`${MessageKeys.genMnemonic}-secure`, (e, encrypted, winId) => {
      const { key, iv } = this.windows.get(winId);
      const { length } = App.decryptIpc(encrypted, iv, key);
      return App.encryptIpc(KeyMan.genMnemonic(length), iv, key);
    });

    ipcMain.handle(`${MessageKeys.saveTmpMnemonic}-secure`, (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { mnemonic } = App.decryptIpc(encrypted, iv, key);
      KeyMan.setTmpMnemonic(mnemonic);
    });

    ipcMain.handle(`${MessageKeys.setupMnemonic}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      if (KeyMan.hasMnemonic) return App.encryptIpc({ success: false }, iv, key);

      const { password: userPassword } = App.decryptIpc(encrypted, iv, key);

      await KeyMan.savePassword(userPassword);
      if (!(await KeyMan.saveMnemonic(userPassword))) return App.encryptIpc({ success: false }, iv, key);

      const addresses = await KeyMan.genAddresses(userPassword, 10);
      runInAction(() => (this.addresses = addresses));

      if (this.touchIDSupported) this.userPassword = userPassword;
      await DBMan.init();
      TxMan.init();

      return App.encryptIpc({ addresses, success: true }, iv, key);
    });

    ipcMain.handle(`${MessageKeys.setDerivationPath}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { fullPath } = App.decryptIpc(encrypted, iv, key);
      await KeyMan.setFullPath(fullPath);
    });

    ipcMain.handle(`${MessageKeys.readMnemonic}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { authKey } = App.decryptIpc(encrypted, iv, key);
      const password = this.authKeys.get(authKey);
      this.authKeys.delete(authKey);

      if (!password) {
        return App.encryptIpc({}, iv, key);
      }

      const mnemonic = await KeyMan.readMnemonic(password);
      return App.encryptIpc({ mnemonic }, iv, key);
    });

    ipcMain.handle(`${MessageKeys.verifyPassword}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { password } = App.decryptIpc(encrypted, iv, key);
      return App.encryptIpc(await KeyMan.verifyPassword(password), iv, key);
    });

    ipcMain.handle(`${MessageKeys.changePassword}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { authKey, newPassword } = App.decryptIpc(encrypted, iv, key);
      const oldPassword = this.authKeys.get(authKey);
      this.authKeys.delete(authKey);

      const mnemonic = await KeyMan.readMnemonic(oldPassword);
      if (!mnemonic) return App.encryptIpc({ success: false }, iv, key);

      KeyMan.setTmpMnemonic(mnemonic);
      await KeyMan.savePassword(newPassword);
      if (!(await KeyMan.saveMnemonic(newPassword))) return App.encryptIpc({ success: false }, iv, key);

      return App.encryptIpc({ success: true }, iv, key);
    });

    ipcMain.handle(`${MessageKeys.initVerifyPassword}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { password, count } = App.decryptIpc(encrypted, iv, key);
      const verified = await KeyMan.verifyPassword(password);
      let addrs: string[] = [];

      if (verified) {
        addrs = await KeyMan.genAddresses(password, count);
        runInAction(() => this.addresses.push(...addrs));

        if (this.touchIDSupported) this.userPassword = password;
      }

      return App.encryptIpc({ verified, addresses: verified ? addrs : [] }, iv, key);
    });

    ipcMain.handle(`${MessageKeys.changeAccountIndex}-secure`, (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { index } = App.decryptIpc(encrypted, iv, key);
      runInAction(() => (this.currentAddressIndex = index));
      return App.encryptIpc({ success: true }, iv, key);
    });

    ipcMain.handle(`${MessageKeys.releaseWindow}-secure`, (e, encrypted, winId) => {
      this.windows.delete(winId);
    });

    ipcMain.handle(`${MessageKeys.resetSystem}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { authKey } = App.decryptIpc(encrypted, iv, key);
      if (!this.authKeys.has(authKey)) {
        return App.encryptIpc({ success: false }, iv, key);
      }

      const password = this.authKeys.get(authKey);
      this.authKeys.clear();

      await KeyMan.reset(password);
      await DBMan.clean();
      await TxMan.clean();
      await WCMan.clean();

      runInAction(() => {
        this.currentAddressIndex = 0;
        this.addresses = [];
      });

      return App.encryptIpc({ success: true }, iv, key);
    });

    ipcMain.handle(`${MessageKeys.changeChainId}`, async (e, id) =>
      runInAction(() => {
        this.chainId = id;
        this.chainProvider.ready;
      })
    );

    ipcMain.handle(`${MessageKeys.sendTx}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const params: SendTxParams = App.decryptIpc(encrypted, iv, key);
      const password = this.extractPassword(params);
      if (!password) return App.encryptIpc('', iv, key);

      const txHex = await KeyMan.signTx(password, this.currentAddressIndex, params);

      if (!txHex) {
        return App.encryptIpc('', iv, key);
      }

      App.sendTx(this.chainId, params, txHex);

      return App.encryptIpc(txHex, iv, key);
    });

    ipcMain.handle(MessageKeys.sendLocalNotification, async (e, content) => {
      new Notification(content).show();
    });

    this.initPopupHandlers();
  }

  static readonly decryptIpc = (encrypted: string, iv: Buffer, key: Buffer) => {
    const serialized = Cipher.decrypt(iv, encrypted, key);
    return JSON.parse(serialized);
  };

  static readonly encryptIpc = (obj: any, iv: Buffer, key: Buffer) => {
    return Cipher.encrypt(iv, JSON.stringify(obj), key);
  };

  extractPassword = (params: SendTxParams) => {
    if (!this.ready) return '';

    const password = params.viaTouchID ? this.userPassword : params.password;
    if (params.from.toLowerCase() !== this.currentAddress.toLowerCase()) {
      return '';
    }

    return password;
  };

  static readonly sendTx = async (chainId: number, params: TxParams, txHex: string) => {
    const { result } = await sendTransaction(chainId, txHex);
    if (!result) {
      new Notification({
        title: i18n.t('Transaction Failed'),
        body: i18n.t('TxFailed2', { nonce: params.nonce }),
      }).show();
      return undefined;
    }

    App.saveTx(params, txHex);
    return result;
  };

  static readonly saveTx = async (params: TxParams, txHex: string) => {
    const tx = utils.parseTransaction(txHex);

    if ((await TxMan.findTxs({ where: { hash: tx.hash } })).length === 0) {
      const t = new Transaction();
      t.chainId = params.chainId;
      t.from = params.from;
      t.to = params.to;
      t.data = params.data;
      t.gas = params.gas;
      t.gasPrice = params.gasPrice;
      t.hash = tx.hash;
      t.nonce = params.nonce;
      t.value = params.value;
      t.timestamp = Date.now();

      TxMan.save(t);
    }

    return tx;
  };

  initPopupHandlers = () => {
    ipcMain.handle(`${MessageKeys.createTransferTx}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const params: ConfirmSendTx = App.decryptIpc(encrypted, iv, key);
      const popup = await this.createPopupWindow('sendTx', params, { modal: true, parent: this.mainWindow });

      await new Promise<boolean>((resolve) => {
        popup.once('close', () => resolve(true));
      });

      return App.encryptIpc(true, iv, key);
    });

    ipcMain.handle(`${MessageKeys.connectWallet}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);
      const { uri, modal } = App.decryptIpc(encrypted, iv, key);
      if (!uri) return;

      return App.encryptIpc((await WCMan.connectAndWaitSession(uri, modal)) ? true : false, iv, key);
    });

    ipcMain.handle(`${MessageKeys.popupAuthentication}-secure`, async (e, encrypted, winId) => {
      const { iv, key } = this.windows.get(winId);

      const authId = randomBytes(4).toString('hex');
      this.createPopupWindow('auth', { authId }, { modal: true, parent: this.mainWindow });

      const result = await new Promise<AuthenticationResult>((resolve) => {
        ipcMain.handleOnce(`${MessageKeys.returnAuthenticationResult(authId)}-secure`, async (e, encrypted, popWinId) => {
          const { iv, key } = this.windows.get(popWinId);
          const { success, password } = App.decryptIpc(encrypted, iv, key) as { success: boolean; password?: string };
          const authKey = success ? randomBytes(8).toString('hex') : '';
          if (authKey) this.authKeys.set(authKey, password || (this.touchIDSupported ? this.userPassword : undefined));

          resolve({ success, authKey });
        });
      });

      return App.encryptIpc(result, iv, key);
    });
  };

  createPopupWindow(
    type: PopupWindowTypes,
    payload: any,
    windowArgs?: { modal?: boolean; parent?: BrowserWindow; height?: number }
  ) {
    let { modal, parent, height } = windowArgs || {};

    height = height ?? (modal ? 340 : 315);
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
