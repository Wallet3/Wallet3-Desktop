import { ConfirmSendTx, WcMessages } from '../common/Messages';

import App from './App';
import ERC20ABI from '../abis/ERC20.json';
import EventEmitter from 'events';
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

  handleSessionRequest = async (error: Error, payload: WCSessionRequestRequest) => {
    if (error) {
      this.emit('error', error);
      return;
    }

    const [{ peerMeta, chainId, peerId }] = payload.params;
    this.peerId = peerId;
    this.chainId = chainId;
    this.peerMeta = peerMeta;

    this.emit('sessionRequest', payload);
    console.log(peerId);

    ipcMain.handleOnce(WcMessages.approveWcSession(this.peerId), this.handleApproveSession);
    ipcMain.handleOnce(WcMessages.rejectWcSession(this.peerId), this.handleRejectSession);

    await App.createPopupWindow('connectDapp', payload.params);
  };

  handleApproveSession = (e: IpcMainInvokeEvent) => {
    this.connector.approveSession({ accounts: App.addresses, chainId: App.chainId });
  };

  handleRejectSession = (e: IpcMainInvokeEvent) => {
    this.connector.rejectSession({ message: 'User cancelled' });
    this.dispose();
  };

  handleCallRequest = async (error: Error, request: WCCallRequestRequest) => {
    console.log(request.method);
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
        break;
      case 'eth_signTypedData':
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

    ipcMain.handleOnce(WcMessages.approveWcCallRequest(this.peerId, request.id), () =>
      this.connector.approveRequest({ id: request.id })
    );

    ipcMain.handleOnce(WcMessages.rejectWcCallRequest(this.peerId, request.id), () =>
      this.connector.rejectRequest({ id: request.id, error: { message: 'User rejected' } })
    );

    App.createPopupWindow('sendTx', {
      chainId: App.chainId,
      from: App.currentAddress,
      to: param.to,
      data: param.data,
      gas: Number.parseInt(param.gas),
      gasPrice: Number.parseInt(param.gasPrice),
      nonce: Number.parseInt(param.nonce),
      value: param.value,

      receipient,
      transferToken,
      walletConnect: { peerId: this.peerId, reqid: request.id },
    } as ConfirmSendTx);
  };

  dispose() {
    this.connector.killSession();
    ipcMain.removeHandler(WcMessages.approveWcSession(this.peerId));
    ipcMain.removeHandler(WcMessages.rejectWcSession(this.peerId));
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
