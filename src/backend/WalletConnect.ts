import { CreateTransferTx, WcMessages } from '../common/Messages';

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

  eth_sendTransaction = async (param: WCCallRequest_eth_sendTransaction) => {
    const balance = await provider.getBalance(App.currentAddress);

    if (param.data?.startsWith('0xa9059cbb')) {
      const iface = new ethers.utils.Interface(ERC20ABI);
      const { dst, wad } = iface.decodeFunctionData('transfer', param.data);
    }

    App.createPopupWindow('sendTx', {
      to: param.to,
      data: param.data,
      gas: Number.parseInt(param.gas),
      gasPrice: Number.parseInt(param.gasPrice),
      nonce: Number.parseInt(param.nonce),
      value: param.value,

      nativeToken: {
        amount: balance.toString(),
        decimals: 18,
      },
    } as CreateTransferTx);
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

  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(), 5000);

      const rejectPromise = () => reject();

      wc.once('error', rejectPromise);
      wc.once('disconnect', rejectPromise);

      wc.once('sessionRequest', () => {
        clearTimeout(timer);
        wc.removeAllListeners('error');
        wc.removeAllListeners('disconnect');
        resolve();
      });
    });

    return wc;
  } catch (error) {
    wc.dispose(); // uri is expired
    return undefined;
  }
}
