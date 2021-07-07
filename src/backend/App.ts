import * as Cipher from '../common/Cipher';
import * as keytar from 'keytar';

import { BrowserWindow, Notification, TouchBar, TouchBarButton, ipcMain, systemPreferences } from 'electron';
import { DBMan, KeyMan, TxMan, TxNotificaion } from './mans';
import MessageKeys, {
  AuthenticationResult,
  ConfirmSendTx,
  InitStatus,
  InitVerifyPassword,
  PopupWindowTypes,
  SendTxParams,
  TxParams,
} from '../common/Messages';
import { createECDH, createHash, randomBytes } from 'crypto';
import { makeObservable, observable, reaction, runInAction } from 'mobx';

import { Networks } from '../misc/Networks';
import Transaction from './models/Transaction';
import i18n from '../i18n';
import { sendTransaction } from '../common/Provider';
import { utils } from 'ethers';

declare const POPUP_WINDOW_WEBPACK_ENTRY: string;
declare const POPUP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export class App {
  touchIDSupported = process.platform === 'darwin' && systemPreferences.canPromptTouchID();

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
    if (this.ready) return;

    console.log('only once');
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

      // TxNotificaion.watch(this.currentNetwork.defaultTokens, addresses, this.chainId);

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

      console.log('new key id', keyId);

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

      const { authKey, newPassword } = App.decryptIpc(cipherText, iv, key);
      const oldPassword = this.walletKey.getAuthKeyPassword(authKey);

      const mnemonic = await this.walletKey.readSecret(oldPassword);
      if (!mnemonic) return App.encryptIpc({ success: false }, key);

      this.walletKey.setTmpSecret(mnemonic);
      await this.walletKey.savePassword(newPassword);
      if (!(await this.walletKey.saveSecret(newPassword))) return App.encryptIpc({ success: false }, key);

      await this.walletKey.initLaunchKey();

      if (this.touchIDSupported) {
        await this.walletKey.encryptUserPassword(newPassword);
      }

      return App.encryptIpc({ success: true }, key);
    });

    ipcMain.handle(`${MessageKeys.initVerifyPassword}-secure`, async (e, encrypted, winId) => {
      const { key } = this.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const { password, count } = App.decryptIpc(cipherText, iv, key);

      try {
        const addresses = (await this.walletKey.genAddresses(password, count)) || [];
        const verified = addresses.length > 0;

        console.log(this.walletKey.id, 'init verify', password, verified, addresses);

        if (verified && this.touchIDSupported) await this.walletKey.encryptUserPassword(password);

        // TxNotificaion.watch(this.currentNetwork.defaultTokens, addrs, this.chainId);

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

      console.log(this.walletKey.id, keyId, 'change account index:', index, this.walletKey.currentAddress);

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
        // TxNotificaion.watch(this.currentNetwork.defaultTokens, this.addresses, id);
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
