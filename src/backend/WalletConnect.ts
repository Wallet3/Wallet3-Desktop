import App, { App as Application } from './App';
import { AuthParams, ConfirmSendTx, RequestSignMessage, SendTxParams, WcMessages } from '../common/Messages';
import { ethers, utils } from 'ethers';
import { getTransactionCount, sendTransaction } from '../common/Provider';

import ERC20ABI from '../abis/ERC20.json';
import EventEmitter from 'events';
import { GasnowWs } from '../api/Gasnow';
import KeyMan from './KeyMan';
import WalletConnector from '@walletconnect/client';
import { ipcMain } from 'electron';

export class WalletConnect extends EventEmitter {
  connector: WalletConnector;
  peerId: string;
  chainId: number;
  peerMeta: WCClientMeta;

  private modal = false;

  constructor(uri: string, modal = false) {
    super();
    this.modal = modal;

    this.connector = new WalletConnector({
      uri,
      clientMeta: {
        name: 'Wallet 3',
        description: 'A secure desktop wallet for Bankless Era',
        icons: [],
        url: 'https://wallet3.io',
      },
    });

    this.connector.on('session_request', this.handleSessionRequest);
    this.connector.on('call_request', this.handleCallRequest);
    this.connector.on('disconnect', (error: Error) => {
      console.log('discconnect');
      this.dispose();
    });
  }

  handleSessionRequest = async (error: Error, request: WCSessionRequestRequest) => {
    if (error) {
      this.emit('error', error);
      return;
    }

    const [{ peerMeta, chainId, peerId }] = request.params;
    this.peerId = peerId;
    this.peerMeta = peerMeta;

    this.emit('sessionRequest', request);

    const clearHandlers = () => {
      ipcMain.removeHandler(WcMessages.approveWcSession(this.peerId));
      ipcMain.removeHandler(WcMessages.rejectWcSession(this.peerId));
    };

    ipcMain.handleOnce(WcMessages.approveWcSession(this.peerId), () => {
      clearHandlers();
      this.connector.approveSession({ accounts: App.addresses, chainId: App.chainId });
      this.chainId = App.chainId;
    });

    ipcMain.handleOnce(WcMessages.rejectWcSession(this.peerId), () => {
      clearHandlers();
      this.connector.rejectSession({ message: 'User cancelled' });
      this.dispose();
    });

    await App.createPopupWindow('connectDapp', request.params, this.modal, this.modal ? App.mainWindow : undefined);
  };

  handleCallRequest = async (error: Error, request: WCCallRequestRequest) => {
    if (error) {
      this.emit('error', error);
      return;
    }

    console.log(request.method);
    console.log(request.id);
    console.log(request.params);

    switch (request.method) {
      case 'eth_sendTransaction':
        const [param] = request.params as WCCallRequest_eth_sendTransaction[];
        this.eth_sendTransaction(request, param);
        break;
      case 'eth_sign':
        break;
      case 'eth_signTransaction':
        break;
      case 'personal_sign':
        this.sign(request, request.params, 'personal_sign');
        break;
      case 'eth_signTypedData':
        this.sign(request, request.params, 'signTypedData');
        break;
    }
  };

  eth_sendTransaction = async (request: WCCallRequestRequest, param: WCCallRequest_eth_sendTransaction) => {
    const receipient: { address: string; name: string } = undefined;
    let transferToken: { balance: string; symbol: string; decimals: number } = undefined;

    if (param.data?.startsWith('0xa9059cbb')) {
      const c = new ethers.Contract(param.to, ERC20ABI, App.chainProvider);
      const decimals = (await c.decimals()).toNumber();
      const symbol = await c.symbol();
      const balance = (await c.balanceOf(App.currentAddress)).toString();

      transferToken = { decimals, symbol, balance };
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

      const hash = await Application.sendTx(this.chainId, params, txHex);

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

    App.createPopupWindow('sendTx', {
      chainId: this.chainId,
      from: App.currentAddress,
      to: param.to,
      data: param.data || '0x',
      gas: Number.parseInt(param.gas) || 21000,
      gasPrice: Number.parseInt(param.gasPrice) || GasnowWs.gwei_20,
      nonce: Number.parseInt(param.nonce) || (await getTransactionCount(this.chainId, App.currentAddress)),
      value: param.value || 0,

      receipient,
      transferToken,
      walletConnect: { peerId: this.peerId, reqid: request.id },
    } as ConfirmSendTx);
  };

  sign = async (request: WCCallRequestRequest, params: any, type: 'personal_sign' | 'signTypedData') => {
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

      return Application.encryptIpc(false, iv, key);
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
    this.removeAllListeners();
  }
}
