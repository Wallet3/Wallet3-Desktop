import * as Cipher from '../common/Cipher';
import * as keytar from 'keytar';

import { BrowserWindow, Notification, TouchBar, TouchBarButton, ipcMain, systemPreferences } from 'electron';
import { DBMan, KeyMan, TxMan, WCMan } from './mans';
import MessageKeys, {
  AuthenticationResult,
  ConfirmSendTx,
  InitStatus,
  PopupWindowTypes,
  SendTxParams,
  TxParams,
} from '../common/Messages';
import { autorun, computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { createECDH, createHash, randomBytes } from 'crypto';

import Transaction from './models/Transaction';
import i18n from '../i18n';
import { sendTransaction } from '../common/Provider';
import { utils } from 'ethers';

declare const POPUP_WINDOW_WEBPACK_ENTRY: string;
declare const POPUP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const Keys = {
  appLaunchKey: 'wallet3-applaunchkey',
  appAccount: (id: string) => `wallet3-core-${id}`,
};

export class App {
  touchIDSupported = process.platform === 'darwin' && systemPreferences.canPromptTouchID();

  windows = new Map<string, { key: Buffer }>();
  mainWindow?: BrowserWindow;
  touchBarButtons?: { walletConnect: TouchBarButton; gas: TouchBarButton; price?: TouchBarButton };

  keyId = 0;
  currentAddressIndex = 0;
  addresses: string[] = [];
  chainId = 1;
  machineId = 'default';

  #userPassword?: string; // keep encrypted password in memory for TouchID users
  #authKeys = new Map<string, string>(); // authId => key

  get currentAddress() {
    return this.addresses[this.currentAddressIndex];
  }

  get ready() {
    return this.addresses.length > 0;
  }

  get walletKey() {
    return KeyMan.current;
  }

  async decryptUserPassword() {
    const secret = await keytar.getPassword(Keys.appLaunchKey, Keys.appAccount(this.machineId));
    const [iv, key] = secret.split(':');
    return Cipher.decrypt(Buffer.from(iv, 'hex'), this.#userPassword, Buffer.from(key, 'hex'));
  }

  async encryptUserPassword(password: string) {
    const secret = await keytar.getPassword(Keys.appLaunchKey, Keys.appAccount(this.machineId));
    const [iv, key] = secret.split(':');
    const [_, enPw] = Cipher.encrypt(password, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    this.#userPassword = enPw;
  }

  async initLaunchKey() {
    const launchIv = Cipher.generateIv().toString('hex');
    const launchKey = Cipher.generateIv(32).toString('hex');

    await keytar.setPassword(Keys.appLaunchKey, Keys.appAccount(this.machineId), `${launchIv}:${launchKey}`);
  }

  async init() {
    await this.initLaunchKey();

    reaction(
      () => TxMan.pendingTxs.length,
      () => this.mainWindow?.webContents.send(MessageKeys.pendingTxsChanged, [...TxMan.pendingTxs])
    );

    reaction(
      () => WCMan.connectedSessions,
      () => this.mainWindow?.webContents.send(MessageKeys.wcConnectsChanged, WCMan.connectedSessions)
    );
  }

  constructor() {
    makeObservable(this, {
      addresses: observable,
      chainId: observable,
      currentAddressIndex: observable,
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

    ipcMain.handle(`${MessageKeys.getInitStatus}-secure`, async (e, _, winId) => {
      const { key } = this.windows.get(winId);

      return App.encryptIpc(
        {
          hasSecret: this.walletKey.hasSecret,
          touchIDSupported: this.touchIDSupported,
          appAuthenticated: this.addresses.length > 0,
          addresses: [...this.addresses],
          connectedDApps: WCMan.connectedSessions,
          pendingTxs: [...TxMan.pendingTxs],
          platform: process.platform,
        } as InitStatus,
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
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;
      const { message } = App.decryptIpc(cipherText, iv, key);

      if (!this.touchIDSupported) return App.encryptIpc({ success: false }, key);

      try {
        await systemPreferences.promptTouchID(message ?? i18n.t('Unlock Wallet'));
        return App.encryptIpc({ success: true }, key);
      } catch (error) {
        return App.encryptIpc({ success: false }, key);
      }
    });

    ipcMain.handle(`${MessageKeys.genMnemonic}-secure`, (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;
      const { length } = App.decryptIpc(cipherText, iv, key);
      return App.encryptIpc(this.walletKey.genMnemonic(length), key);
    });

    ipcMain.handle(`${MessageKeys.saveTmpSecret}-secure`, (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { secret } = App.decryptIpc(cipherText, iv, key);
      return App.encryptIpc({ success: this.walletKey.setTmpSecret(secret) }, key );
    });

    ipcMain.handle(`${MessageKeys.setupMnemonic}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      if (this.walletKey.hasSecret) return App.encryptIpc({ success: false }, key);

      const [iv, cipherText] = encrypted;
      const { password: userPassword } = App.decryptIpc(cipherText, iv, key);
      await DBMan.init();

      await this.walletKey.savePassword(userPassword);
      if (!(await this.walletKey.saveSecret(userPassword))) return App.encryptIpc({ success: false }, key);

      const addresses = await this.walletKey.genAddresses(userPassword, 10);
      runInAction(() => (this.addresses = addresses));

      if (this.touchIDSupported) this.encryptUserPassword(userPassword);

      TxMan.init();

      return App.encryptIpc({ addresses, success: true }, key);
    });

    ipcMain.handle(`${MessageKeys.setDerivationPath}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { fullPath } = App.decryptIpc(cipherText, iv, key);
      await this.walletKey.setFullPath(fullPath);
    });

    ipcMain.handle(`${MessageKeys.readMnemonic}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { authKey } = App.decryptIpc(cipherText, iv, key);
      const password = this.#authKeys.get(authKey);
      this.#authKeys.delete(authKey);

      if (!password) {
        return App.encryptIpc({}, key);
      }

      const mnemonic = await this.walletKey.readSecret(password);
      return App.encryptIpc({ mnemonic }, key);
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

      const { authKey, newPassword } = App.decryptIpc(cipherText, iv, key);
      const oldPassword = this.#authKeys.get(authKey);
      this.#authKeys.delete(authKey);

      const mnemonic = await this.walletKey.readSecret(oldPassword);
      if (!mnemonic) return App.encryptIpc({ success: false }, key);

      this.walletKey.setTmpSecret(mnemonic);
      await this.walletKey.savePassword(newPassword);
      if (!(await this.walletKey.saveSecret(newPassword))) return App.encryptIpc({ success: false }, key);

      await this.initLaunchKey();

      if (this.touchIDSupported) {
        this.encryptUserPassword(newPassword);
      }

      return App.encryptIpc({ success: true }, key);
    });

    ipcMain.handle(`${MessageKeys.initVerifyPassword}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { password, count } = App.decryptIpc(cipherText, iv, key);

      try {
        const verified = await this.walletKey.verifyPassword(password);

        let addrs: string[] = [];

        if (verified) {
          addrs = await this.walletKey.genAddresses(password, count);

          runInAction(() => this.addresses.push(...addrs));

          if (this.touchIDSupported) this.encryptUserPassword(password);
        }

        return App.encryptIpc({ verified, addresses: verified ? addrs : [] }, key);
      } catch (error) {
        return App.encryptIpc({ verified: false, addresses: [] }, key);
      }
    });

    ipcMain.handle(`${MessageKeys.changeAccountIndex}-secure`, (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { index } = App.decryptIpc(cipherText, iv, key);
      runInAction(() => (this.currentAddressIndex = index));
      return App.encryptIpc({ success: true }, key);
    });

    ipcMain.handle(`${MessageKeys.releaseWindow}-secure`, (e, encrypted, winId) => {
      this.windows.delete(winId);
    });

    ipcMain.handle(`${MessageKeys.resetSystem}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { authKey } = App.decryptIpc(cipherText, iv, key);

      if (!this.#authKeys.has(authKey) && authKey !== 'forgotpassword-reset') {
        return App.encryptIpc({ success: false }, key);
      }

      const password = this.#authKeys.get(authKey);
      this.#authKeys.clear();

      await this.walletKey.reset(password, authKey === 'forgotpassword-reset' ? false : true);
      await TxMan.clean();
      await WCMan.clean();
      await DBMan.clean();

      runInAction(() => {
        this.currentAddressIndex = 0;
        this.addresses = [];
      });

      return App.encryptIpc({ success: true }, key);
    });

    ipcMain.handle(`${MessageKeys.changeChainId}`, async (e, id) => runInAction(() => (this.chainId = id)));

    ipcMain.handle(`${MessageKeys.sendTx}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const params: SendTxParams = App.decryptIpc(cipherText, iv, key);
      const password = await this.extractPassword(params);
      if (!password) return App.encryptIpc({}, key);

      const txHex = await this.walletKey.signTx(password, this.currentAddressIndex, params);

      if (!txHex) {
        return App.encryptIpc({}, key);
      }

      App.sendTx(params.chainId || this.chainId, params, txHex);

      return App.encryptIpc({ txHex }, key);
    });

    ipcMain.handle(MessageKeys.sendLocalNotification, async (e, content) => {
      new Notification(content).show();
    });

    ipcMain.handle(MessageKeys.setLang, async (e, content) => {
      const { lang } = content;
      i18n.changeLanguage(lang);
    });

    ipcMain.handle(MessageKeys.getHistoryTxs, async () => {
      const txs = await TxMan.getHistoryTxs(this.currentAddress);
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

    if (params.from.toLowerCase() !== this.currentAddress.toLowerCase()) {
      return '';
    }

    const password = params.viaTouchID ? await this.decryptUserPassword() : params.password;
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
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const params: ConfirmSendTx = App.decryptIpc(cipherText, iv, key);
      const popup = await this.createPopupWindow('sendTx', params, { modal: true, parent: this.mainWindow });

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

      const success = (await WCMan.connectAndWaitSession(uri, modal)) ? true : false;
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
          const authKey = success ? randomBytes(8).toString('hex') : '';
          if (authKey) {
            this.#authKeys.set(authKey, password || (this.touchIDSupported ? await this.decryptUserPassword() : ''));
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
      const reqid = randomBytes(4).toString('hex');
      this.createPopupWindow('msgbox', { reqid, ...params }, { modal: true, parent: this.mainWindow, height: 250 });

      const approved = await new Promise<boolean>((resolve) => {
        ipcMain.handleOnce(`${MessageKeys.returnMsgBoxResult(reqid)}-secure`, async (e, encrypted, popWinId) => {
          const { key } = this.windows.get(popWinId);
          const [iv, cipherText] = encrypted;

          const { approved } = App.decryptIpc(cipherText, iv, key) as { approved: boolean };

          resolve(approved);
        });
      });

      return App.encryptIpc({ approved }, key);
    });
  };

  createPopupWindow(
    type: PopupWindowTypes,
    payload: any,
    windowArgs?: { modal?: boolean; parent?: BrowserWindow; height?: number }
  ) {
    let { modal, parent, height } = windowArgs || {};

    height = height ?? (modal ? 333 : 320);
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
