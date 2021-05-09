import { ConfirmSendTx, RequestSignMessage, WcMessages } from '../common/Messages';

import App from './App';
import ERC20ABI from '../abis/ERC20.json';
import EventEmitter from 'events';
import { GasnowWs } from '../api/Gasnow';
import { IpcMainInvokeEvent } from 'electron/main';
import WalletConnector from '@walletconnect/client';
import { ethers } from 'ethers';
import { ipcMain } from 'electron';
import provider from '../common/Provider';

export class WalletConnect extends EventEmitter {
  connector: WalletConnector;
  peerId: string;
  chainId: number;
  peerMeta: WCClientMeta;

  constructor(uri: string) {
    super();

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
    this.connector.on('disconnect', (error: Error) => this.emit('disconnect'));
  }

  handleSessionRequest = async (error: Error, request: WCSessionRequestRequest) => {
    if (error) {
      this.emit('error', error);
      return;
    }

    const [{ peerMeta, chainId, peerId }] = request.params;
    this.peerId = peerId;
    this.chainId = chainId;
    this.peerMeta = peerMeta;

    this.emit('sessionRequest', request);

    const clearHandlers = () => {
      ipcMain.removeHandler(WcMessages.approveWcSession(this.peerId, request.id));
      ipcMain.removeHandler(WcMessages.rejectWcSession(this.peerId, request.id));
    };

    ipcMain.handleOnce(WcMessages.approveWcSession(this.peerId, request.id), () => {
      clearHandlers();
      this.connector.approveSession({ accounts: App.addresses, chainId: App.chainId });
    });

    ipcMain.handleOnce(WcMessages.rejectWcSession(this.peerId, request.id), () => {
      clearHandlers();
      this.connector.rejectSession({ message: 'User cancelled' });
      this.dispose();
    });

    await App.createPopupWindow('connectDapp', request.params);
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
      const c = new ethers.Contract(param.to, ERC20ABI, provider);
      const decimals = (await c.decimals()).toNumber();
      const symbol = await c.symbol();
      const balance = (await c.balanceOf(App.currentAddress)).toString();

      transferToken = { decimals, symbol, balance };
    }

    const clearHandlers = () => {
      ipcMain.removeHandler(`${WcMessages.approveWcCallRequest(this.peerId, request.id)}-secure`);
      ipcMain.removeHandler(`${WcMessages.rejectWcCallRequest(this.peerId, request.id)}-secure`);
    };

    ipcMain.handleOnce(`${WcMessages.approveWcCallRequest(this.peerId, request.id)}-secure`, () => {
      clearHandlers();
      this.connector.approveRequest({ id: request.id });
    });

    ipcMain.handleOnce(`${WcMessages.rejectWcCallRequest(this.peerId, request.id)}-secure`, () => {
      clearHandlers();
      this.connector.rejectRequest({ id: request.id, error: { message: 'User rejected' } });
    });

    App.createPopupWindow('sendTx', {
      chainId: App.chainId,
      from: App.currentAddress,
      to: param.to,
      data: param.data || '0x',
      gas: Number.parseInt(param.gas) || 21000,
      gasPrice: Number.parseInt(param.gasPrice) || GasnowWs.gwei_20,
      nonce: Number.parseInt(param.nonce) || (await provider.getTransactionCount(App.currentAddress)),
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

    ipcMain.handleOnce(`${WcMessages.approveWcCallRequest(this.peerId, request.id)}-secure`, (e, encrypted) => {
      clearHandlers();

      switch (type) {
        case 'personal_sign':
          break;
        case 'signTypedData':
          break;
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
    this.connector.killSession();
    this.removeAllListeners();
  }
}

export async function connectAndWaitSession(uri: string) {
  const wc = new WalletConnect(uri);

  return await new Promise<WalletConnect>((resolve) => {
    const timer = setTimeout(() => rejectPromise(), 7000);

    const rejectPromise = () => {
      clearTimeout(timer);
      resolve(undefined);
      wc.dispose(); // uri is expired
    };

    wc.once('error', rejectPromise);
    wc.once('disconnect', rejectPromise);

    wc.once('sessionRequest', () => {
      clearTimeout(timer);
      wc.removeAllListeners('error');
      wc.removeAllListeners('disconnect');
      resolve(wc);
    });
  });
}
