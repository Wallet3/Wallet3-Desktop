import App, { App as Application } from '../App';
import { AuthParams, ConfirmSendTx, RequestSignMessage, SendTxParams, WcMessages } from '../../common/Messages';
import { BigNumber, ethers, utils } from 'ethers';
import { IReactionDisposer, reaction } from 'mobx';
import {
  call,
  estimateGas,
  getGasPrice,
  getMaxPriorityFee,
  getNextBlockBaseFee,
  getTransactionCount,
} from '../../common/Provider';

import EIP1559Price from '../../gas/EIP1559Price';
import ERC20ABI from '../../abis/ERC20.json';
import EventEmitter from 'events';
import { Gwei_1 } from '../../common/Constants';
import { Networks } from '../../common/Networks';
import { TxMan } from '../mans';
import WCSession from '../models/WCSession';
import WalletConnector from '@walletconnect/client';
import { WalletKey } from './WalletKey';
import { findTokenByAddress } from '../../misc/Tokens';
import i18n from '../../i18n';
import { ipcMain } from 'electron';

export class WalletConnect extends EventEmitter {
  connector: WalletConnector;
  peerId: string;
  appMeta: WCClientMeta;

  private key: WalletKey;

  get appChainId() {
    return this._userChainId || App.chainId;
  }

  get userChainId() {
    return this._userChainId;
  }

  get wallet() {
    return this.key;
  }

  private _userChainId = 0; // 0 - auto switch
  private _modal = false;
  private _chainIdObserver: IReactionDisposer;
  private _currAddrObserver: IReactionDisposer;
  private _wcSession: WCSession;

  constructor({ modal, key }: { modal?: boolean; key: WalletKey }) {
    super();
    this._modal = modal;
    this.key = key;

    this._chainIdObserver = reaction(
      () => App.chainId,
      () => {
        if (this._userChainId !== 0) return;
        this.updateSession();
      }
    );

    this._currAddrObserver = reaction(
      () => this.wallet.currentAddressIndex,
      () => this.updateSession()
    );
  }

  connect(uri: string) {
    this.connector = new WalletConnector({
      uri,
      clientMeta: {
        name: 'Wallet 3',
        description: 'A Secure Wallet for Web3 Era',
        icons: [],
        url: 'https://wallet3.io',
      },
    });

    this.connector.on('session_request', this.handleSessionRequest);
    this.connector.on('call_request', this.handleCallRequest);
    this.connector.on('disconnect', () => this.emit('disconnect'));
    this.connector.on('transport_error', () => this.emit('transport_error'));
    this.connector.on('transport_open', () => this.emit('transport_open'));
  }

  connectViaSession(session: IRawWcSession) {
    this.connector = new WalletConnector({ session });

    this.connector.on('session_request', this.handleSessionRequest);
    this.connector.on('call_request', this.handleCallRequest);
    this.connector.on('disconnect', () => this.emit('disconnect'));
    this.connector.on('transport_error', () => this.emit('transport_error'));
    this.connector.on('transport_open', () => this.emit('transport_open'));

    this.peerId = session.peerId;
    this.appMeta = session.peerMeta;
  }

  get session() {
    return {
      ...this.connector?.session,
      lastUsedTimestamp: this.wcSession?.lastUsedTimestamp ?? 0,
      userChainId: this.userChainId,
    };
  }

  get wcSession() {
    return this._wcSession;
  }

  set wcSession(value: WCSession) {
    this._wcSession = value;
    this._userChainId = value.userChainId;
  }

  switchNetwork(chainId: number) {
    if (this.userChainId === chainId) return;

    this._userChainId = chainId;
    this.updateSession();
    this.emit('sessionUpdated');
  }

  private updateSession() {
    if (!this.key.authenticated) return;

    try {
      this.connector?.updateSession({ chainId: this.appChainId, accounts: [this.wallet.currentAddress] });
    } catch (error) {
      this.emit('disconnect');
    }
  }

  private handleSessionRequest = async (error: Error, request: WCSessionRequestRequest) => {
    if (error) {
      this.emit('error', error);
      return;
    }

    if (!this.key.authenticated) {
      this.connector.rejectSession({ message: 'This account has not been authorized' });

      App.createPopupWindow(
        'msgbox',
        {
          title: i18n.t('Authentication'),
          icon: 'alert-triangle',
          message: i18n.t('Wallet not authorized'),
        },
        { height: 250 }
      );
      return;
    }

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

      this.connector.approveSession({ accounts: [this.wallet.currentAddress], chainId: this.appChainId });

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

    if (!this.key.authenticated) {
      this.connector.rejectRequest({ id: request.id, error: { message: 'This account has not been authorized' } });
      return;
    }

    const checkAccount = (from: string) => {
      if (from?.toLowerCase() === this.wallet.currentAddress.toLowerCase()) return true;
      this.connector.rejectRequest({ id: request.id, error: { message: 'Update session' } });
      this.updateSession();
      return false;
    };

    // console.log(request.method);
    // console.log(request.params);

    switch (request.method) {
      case 'eth_sendTransaction':
        const [param, chainId] = request.params as [WCCallRequest_eth_sendTransaction, string];
        if (!checkAccount(param.from)) return;

        this.eth_sendTransaction(request, param, chainId ? Number.parseInt(chainId) : undefined);
        break;
      case 'eth_signTransaction':
        this.connector.rejectRequest({ id: request.id, error: { message: 'Use eth_sendTransaction' } });
        return;
      case 'eth_sign':
        if (!checkAccount(request.params[0])) return;
        this.sign(request, request.params, 'eth_sign');
        break;
      case 'personal_sign':
        if (!checkAccount(request.params[1])) return;
        this.sign(request, request.params, 'personal_sign');
        break;
      case 'eth_signTypedData':
        if (!checkAccount(request.params[0])) return;
        this.sign(request, request.params, 'signTypedData');
        break;
    }

    this.emit('sessionUpdated');
  };

  private eth_sendTransaction = async (
    request: WCCallRequestRequest,
    param: WCCallRequest_eth_sendTransaction,
    requestedChainId?: number
  ) => {
    let transferToken: { balance: string; symbol: string; decimals: number } = undefined;

    if (param.data?.startsWith('0xa9059cbb')) {
      const found = findTokenByAddress(param.to);
      const erc20 = new ethers.utils.Interface(ERC20ABI);
      const call_symbol = erc20.encodeFunctionData('symbol');
      const call_decimals = erc20.encodeFunctionData('decimals');
      const call_balance = erc20.encodeFunctionData('balanceOf', [this.wallet.currentAddress]);

      const [symbolData, decimalsData, balanceOfData] = await Promise.all([
        call<string>(requestedChainId || this.appChainId, { to: param.to, data: call_symbol }),
        call<string>(requestedChainId || this.appChainId, { to: param.to, data: call_decimals }),
        call<string>(requestedChainId || this.appChainId, { to: param.to, data: call_balance }),
      ]);

      const [balance] = erc20.decodeFunctionResult('balanceOf', balanceOfData) as [BigNumber];

      if (found) {
        transferToken = { ...found, balance: balance.toString() };
      } else {
        const [symbol] = erc20.decodeFunctionResult('symbol', symbolData) as [string];
        const [decimals] = erc20.decodeFunctionResult('decimals', decimalsData) as [number];

        transferToken = { decimals, symbol, balance: balance.toString() };
      }
    }

    const clearHandlers = () => {
      ipcMain.removeHandler(`${WcMessages.approveWcCallRequest(this.peerId, request.id)}-secure`);
      ipcMain.removeHandler(`${WcMessages.rejectWcCallRequest(this.peerId, request.id)}-secure`);
    };

    ipcMain.handleOnce(`${WcMessages.approveWcCallRequest(this.peerId, request.id)}-secure`, async (e, encrypted, winId) => {
      clearHandlers();

      const { key } = App.windows.get(winId);
      const [iv, cipherText] = encrypted;

      const params: SendTxParams = Application.decryptIpc(cipherText, iv, key);

      const password = await App.extractPassword(params);
      if (!password) return Application.encryptIpc({}, key);

      const txHex = await this.wallet.signTx(password, params);
      if (!txHex) {
        this.connector.rejectRequest({ id: request.id, error: { message: 'Invalid data' } });
        return;
      }

      const hash = await TxMan.sendTx(params.chainId || this.appChainId, params, txHex);

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

    const recipient = this.wallet.addresses.find((addr) => addr === utils.getAddress(param.to))
      ? {
          address: param.to,
          name: `Account ${this.wallet.addresses.indexOf(utils.getAddress(param.to)) + 1}`,
        }
      : undefined;

    const chainId = requestedChainId || this.appChainId;
    const network = Networks.find((n) => n.chainId === chainId);
    if (!network) return;

    const { eip1559, minGwei } = network;

    let defaultGasPrice = (minGwei ?? 1) * Gwei_1;
    defaultGasPrice = chainId === 1 ? EIP1559Price.fast : defaultGasPrice;

    let baseFee: number = undefined;
    let priorityFee: number = undefined;
    if (eip1559) {
      [baseFee, priorityFee] = await Promise.all([getNextBlockBaseFee(chainId), getMaxPriorityFee(chainId)]);
      priorityFee += 2 * Gwei_1;
      baseFee = Math.max(Number.parseInt((baseFee * 1.5) as any), priorityFee);
    }

    const baseTx = {
      from: this.wallet.currentAddress,
      to: param.to,
      data: param.data || '0x',
    };

    const gas =
      Number.parseInt(param.gas) ||
      Number.parseInt((Number.parseInt(await estimateGas(chainId, baseTx)) * 1.5) as any) ||
      21000;

    App.createPopupWindow(
      'sendTx',
      {
        chainId,
        accountIndex: this.wallet.currentAddressIndex,

        ...baseTx,
        value: param.value || 0,
        gasPrice: eip1559 ? undefined : Number.parseInt(param.gasPrice) || (await getGasPrice(chainId)) || defaultGasPrice,
        maxFeePerGas: baseFee,
        maxPriorityFeePerGas: priorityFee,
        gas,
        nonce:
          Number.parseInt(param.nonce) ||
          (await getTransactionCount(requestedChainId ?? this.appChainId, this.wallet.currentAddress)),

        recipient,
        transferToken,
        walletConnect: { peerId: this.peerId, reqid: request.id, app: this.appMeta },
      } as ConfirmSendTx,
      { height: eip1559 ? 375 : undefined }
    );
  };

  private sign = async (
    request: WCCallRequestRequest,
    params: string[],
    type: 'eth_sign' | 'personal_sign' | 'signTypedData'
  ) => {
    const clearHandlers = () => {
      ipcMain.removeHandler(`${WcMessages.approveWcCallRequest(this.peerId, request.id)}-secure`);
      ipcMain.removeHandler(`${WcMessages.rejectWcCallRequest(this.peerId, request.id)}-secure`);
    };

    ipcMain.handleOnce(`${WcMessages.approveWcCallRequest(this.peerId, request.id)}-secure`, async (e, encrypted, winId) => {
      clearHandlers();

      const { key } = App.windows.get(winId);
      const [iv, cipherText] = encrypted;

      let { password, viaTouchID }: AuthParams = Application.decryptIpc(cipherText, iv, key);

      password = password ?? (viaTouchID ? await this.wallet.decryptUserPassword() : undefined);

      if (!password) {
        this.connector.rejectRequest({ id: request.id, error: { message: 'Permission Denied' } });
        return Application.encryptIpc({ success: false }, key);
      }

      const signMessage = async (message: string) => {
        const signed = await this.wallet.personalSignMessage(password, this.wallet.currentAddressIndex, message);

        if (!signed) {
          this.connector.rejectRequest({ id: request.id, error: { message: 'Permission Denied' } });
          return false;
        }

        this.connector.approveRequest({ id: request.id, result: signed });
        return true;
      };

      switch (type) {
        case 'eth_sign':
          return Application.encryptIpc({ success: await signMessage(params[1]) }, key);
        case 'personal_sign':
          return Application.encryptIpc({ success: await signMessage(params[0]) }, key);
        case 'signTypedData':
          let signed = '';

          try {
            const typedData = JSON.parse(params[1]);
            signed = await this.wallet.signTypedData_v4(password, this.wallet.currentAddressIndex, typedData);
          } catch (error) {
            this.connector.rejectRequest({ id: request.id, error: { message: 'Invalid Typed Data' } });
            return Application.encryptIpc({ success: false }, key);
          }

          if (!signed) {
            this.connector.rejectRequest({ id: request.id, error: { message: 'Permission Denied' } });
            return Application.encryptIpc({ success: false }, key);
          }

          this.connector.approveRequest({ id: request.id, result: signed });
          return Application.encryptIpc({ success: true }, key);
      }
    });

    ipcMain.handleOnce(`${WcMessages.rejectWcCallRequest(this.peerId, request.id)}-secure`, () => {
      clearHandlers();
      this.connector.rejectRequest({ id: request.id, error: { message: 'User rejected' } });
    });

    let msg: string;
    let json = false;

    switch (type) {
      case 'eth_sign':
        msg = Buffer.from(utils.arrayify(params[1])).toString('utf8');
        break;
      case 'personal_sign':
        msg = Buffer.from(utils.arrayify(params[0])).toString('utf8');
        break;
      case 'signTypedData':
        const data = JSON.parse(params[1]);
        delete data.types;
        msg = JSON.stringify(data);
        json = true;
        break;
    }

    App.createPopupWindow('sign', {
      raw: params,
      msg,
      json,
      walletConnect: { peerId: this.peerId, reqid: request.id },
    } as RequestSignMessage);
  };

  disconnect(msg?: string) {
    return this.connector.killSession({ message: msg ?? 'User quits' });
  }

  dispose() {
    this._chainIdObserver?.();
    this._currAddrObserver?.();
    this.removeAllListeners();

    this.connector?.off('session_request');
    this.connector?.off('call_request');
    this.connector?.off('disconnect');
    this.connector?.off('transport_error');
    this.connector?.off('transport_open');
    this.connector?.transportClose();

    this.connector = undefined;
    this.key = undefined;
    this._wcSession = undefined;
    this.handleCallRequest = undefined;
    this.handleSessionRequest = undefined;
    this.eth_sendTransaction = undefined;
    this.sign = undefined;

    this._chainIdObserver = undefined;
    this._currAddrObserver = undefined;
  }
}
