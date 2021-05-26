import App, { App as Application } from './App';
import { AuthParams, ConfirmSendTx, RequestSignMessage, SendTxParams, WcMessages } from '../common/Messages';
import { IReactionDisposer, reaction } from 'mobx';

import ERC20ABI from '../abis/ERC20.json';
import EventEmitter from 'events';
import { GasnowWs } from '../api/Gasnow';
import KeyMan from './KeyMan';
import WCSession from './models/WCSession';
import WalletConnector from '@walletconnect/client';
import { ethers } from 'ethers';
import { findTokenByAddress } from '../ui/misc/Tokens';
import { getTransactionCount } from '../common/Provider';
import { ipcMain } from 'electron';

export class WalletConnect extends EventEmitter {
  connector: WalletConnector;
  peerId: string;
  appMeta: WCClientMeta;

  get appChainId() {
    return this._userChainId || App.chainId;
  }

  get userChainId() {
    return this._userChainId;
  }

  private _userChainId = 0; // 0 - auto switch
  private _modal = false;
  private _chainIdObserver: IReactionDisposer;
  private _currAddrObserver: IReactionDisposer;
  private _wcSession: WCSession;

  constructor(modal = false) {
    super();
    this._modal = modal;

    this._chainIdObserver = reaction(
      () => App.chainId,
      () => {
        if (this._userChainId !== 0) return;
        this.updateSession();
      }
    );

    this._currAddrObserver = reaction(
      () => App.currentAddressIndex,
      () => this.updateSession()
    );
  }

  connect(uri: string) {
    this.connector = new WalletConnector({
      uri,
      clientMeta: {
        name: 'Wallet 3',
        description: 'A Wallet for Bankless Era',
        icons: [],
        url: 'https://wallet3.io',
      },
    });

    this.connector.on('session_request', this.handleSessionRequest);
    this.connector.on('call_request', this.handleCallRequest);
    this.connector.on('disconnect', () => this.emit('disconnect', this));
  }

  connectViaSession(session: IWcSession) {
    this.connector = new WalletConnector({ session });

    this.connector.on('session_request', this.handleSessionRequest);
    this.connector.on('call_request', this.handleCallRequest);
    this.connector.on('disconnect', () => this.emit('disconnect', this));
    this.peerId = session.peerId;
    this.appMeta = session.peerMeta;
  }

  get session() {
    return this.connector?.session;
  }

  get wcSession() {
    return this._wcSession;
  }

  set wcSession(value: WCSession) {
    this._wcSession = value;
    this._userChainId = value.userChainId;
  }

  updateSession() {
    this.connector?.updateSession({ chainId: this.appChainId, accounts: [App.currentAddress] });
    this.emit('sessionUpdated', this?.session);
  }

  private handleSessionRequest = async (error: Error, request: WCSessionRequestRequest) => {
    if (error) {
      this.emit('error', error);
      return;
    }

    if (!App.ready) return;

    this.emit('sessionRequest');

    const [{ peerMeta, peerId }] = request.params;
    this.peerId = peerId;
    this.appMeta = peerMeta;

    const clearHandlers = () => {
      ipcMain.removeHandler(WcMessages.approveWcSession(this.peerId));
      ipcMain.removeHandler(WcMessages.rejectWcSession(this.peerId));
    };

    ipcMain.handleOnce(WcMessages.approveWcSession(this.peerId), (e, c) => {
      clearHandlers();
      this._userChainId = c?.userChainId || 0;
      this.connector.approveSession({ accounts: [App.currentAddress], chainId: this.appChainId });
      this.emit('sessionApproved', this.connector.session);
    });

    ipcMain.handleOnce(WcMessages.rejectWcSession(this.peerId), () => {
      clearHandlers();
      this.connector.rejectSession({ message: 'User cancelled' });
      this.dispose();
    });

    await App.createPopupWindow('connectDapp', request.params, {
      modal: this._modal,
      parent: this._modal ? App.mainWindow : undefined,
    });
  };

  private handleCallRequest = async (error: Error, request: WCCallRequestRequest) => {
    if (error) {
      this.emit('error', error);
      return;
    }

    if (!App.ready) return;

    console.log(request.method);
    console.log(request.id);
    console.log(request.params);

    const checkAccount = (from: string) => {
      if (from?.toLowerCase() === App.currentAddress.toLowerCase()) return true;
      this.connector.rejectRequest({ id: request.id, error: { message: 'Update session' } });
      this.updateSession();
      return false;
    };

    switch (request.method) {
      case 'eth_sendTransaction':
        const [param] = request.params as WCCallRequest_eth_sendTransaction[];
        if (checkAccount(param.from)) this.eth_sendTransaction(request, param);
        break;
      case 'eth_sign':
        break;
      case 'eth_signTransaction':
        break;
      case 'personal_sign':
        if (checkAccount(request.params[1])) this.sign(request, request.params, 'personal_sign');
        break;
      case 'eth_signTypedData':
        this.sign(request, request.params, 'signTypedData');
        break;
    }
  };

  private eth_sendTransaction = async (request: WCCallRequestRequest, param: WCCallRequest_eth_sendTransaction) => {
    const receipient: { address: string; name: string } = undefined;
    let transferToken: { balance: string; symbol: string; decimals: number } = undefined;

    if (param.data?.startsWith('0xa9059cbb')) {
      const found = findTokenByAddress(param.to);
      const c = new ethers.Contract(param.to, ERC20ABI, App.chainProvider);
      const balance = (await c.balanceOf(App.currentAddress)).toString();

      if (found) {
        transferToken = { ...found, balance };
      } else {
        const decimals = (await c.decimals()).toNumber();
        const symbol = await c.symbol();

        transferToken = { decimals, symbol, balance };
      }
    }

    const clearHandlers = () => {
      ipcMain.removeHandler(`${WcMessages.approveWcCallRequest(this.peerId, request.id)}-secure`);
      ipcMain.removeHandler(`${WcMessages.rejectWcCallRequest(this.peerId, request.id)}-secure`);
    };

    ipcMain.handleOnce(`${WcMessages.approveWcCallRequest(this.peerId, request.id)}-secure`, async (e, encrypted, winId) => {
      clearHandlers();

      const { iv, key } = App.windows.get(winId);
      const params: SendTxParams = Application.decryptIpc(encrypted, iv, key);

      const password = App.extractPassword(params);
      if (!password) return Application.encryptIpc('', iv, key);

      const txHex = await KeyMan.signTx(password, App.currentAddressIndex, params);
      if (!txHex) {
        this.connector.rejectRequest({ id: request.id, error: { message: 'Invalid data' } });
        return;
      }

      const hash = await Application.sendTx(this.appChainId, params, txHex);

      if (!hash) {
        this.connector.rejectRequest({ id: request.id, error: { message: 'Transaction failed' } });
        return;
      }

      this.connector.approveRequest({ id: request.id, result: hash });
    });

    ipcMain.handleOnce(`${WcMessages.rejectWcCallRequest(this.peerId, request.id)}-secure`, () => {
      clearHandlers();
      this.connector.rejectRequest({ id: request.id, error: { message: 'User rejected' } });
    });

    App.createPopupWindow(
      'sendTx',
      {
        chainId: this.appChainId,
        from: App.currentAddress,
        accountIndex: App.currentAddressIndex,
        to: param.to,
        data: param.data || '0x',
        gas: Number.parseInt(param.gas) || 21000,
        gasPrice: Number.parseInt(param.gasPrice) || GasnowWs.gwei_20,
        nonce: Number.parseInt(param.nonce) || (await getTransactionCount(this.appChainId, App.currentAddress)),
        value: param.value || 0,

        receipient,
        transferToken,
        walletConnect: { peerId: this.peerId, reqid: request.id, app: this.appMeta },
      } as ConfirmSendTx,
      { height: 339 }
    );
  };

  private sign = async (request: WCCallRequestRequest, params: any, type: 'personal_sign' | 'signTypedData') => {
    const clearHandlers = () => {
      ipcMain.removeHandler(`${WcMessages.approveWcCallRequest(this.peerId, request.id)}-secure`);
      ipcMain.removeHandler(`${WcMessages.rejectWcCallRequest(this.peerId, request.id)}-secure`);
    };

    ipcMain.handleOnce(`${WcMessages.approveWcCallRequest(this.peerId, request.id)}-secure`, async (e, encrypted, winId) => {
      clearHandlers();

      const { iv, key } = App.windows.get(winId);
      let { password, viaTouchID }: AuthParams = Application.decryptIpc(encrypted, iv, key);

      password = password ?? (viaTouchID ? App.userPassword : undefined);

      if (!password) {
        this.connector.rejectRequest({ id: request.id, error: { message: 'Permission Denied' } });
        return Application.encryptIpc(false, iv, key);
      }

      let msg: any;
      let signed = '';

      switch (type) {
        case 'personal_sign':
          msg = params[0];
          signed = await KeyMan.personalSignMessage(password, App.currentAddressIndex, msg);

          if (!signed) {
            this.connector.rejectRequest({ id: request.id, error: { message: 'Permission Denied' } });
            return Application.encryptIpc(false, iv, key);
          }

          this.connector.approveRequest({ id: request.id, result: signed });
          return Application.encryptIpc(true, iv, key);
        case 'signTypedData':
          msg = params[1];
          try {
            const typedData = JSON.parse(msg);
            signed = await KeyMan.signTypedData(password, App.currentAddressIndex, typedData);
          } catch (error) {
            this.connector.rejectRequest({ id: request.id, error: { message: 'Invalid Typed Data' } });
            return Application.encryptIpc(false, iv, key);
          }

          if (!signed) {
            this.connector.rejectRequest({ id: request.id, error: { message: 'Permission Denied' } });
            return Application.encryptIpc(false, iv, key);
          }

          this.connector.approveRequest({ id: request.id, result: signed });
          return Application.encryptIpc(true, iv, key);
      }
    });

    ipcMain.handleOnce(`${WcMessages.rejectWcCallRequest(this.peerId, request.id)}-secure`, () => {
      clearHandlers();
      this.connector.rejectRequest({ id: request.id, error: { message: 'User rejected' } });
    });

    App.createPopupWindow('sign', {
      raw: params,
      walletConnect: { peerId: this.peerId, reqid: request.id },
    } as RequestSignMessage);
  };

  dispose() {
    this._chainIdObserver?.();
    this._currAddrObserver?.();
    this.removeAllListeners();

    this._chainIdObserver = undefined;
    this._currAddrObserver = undefined;
  }
}
