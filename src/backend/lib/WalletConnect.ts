import App, { App as Application } from '../App';
import { AuthParams, ConfirmSendTx, RequestSignMessage, SendTxParams, WcMessages } from '../../common/Messages';
import { BigNumber, ethers, utils } from 'ethers';
import Gasnow, { GasnowWs } from '../../gas/Gasnow';
import { IReactionDisposer, reaction } from 'mobx';
import { call, getTransactionCount } from '../../common/Provider';

import ERC20ABI from '../../abis/ERC20.json';
import EventEmitter from 'events';
import WCSession from '../models/WCSession';
import WalletConnector from '@walletconnect/client';
import { WalletKey } from './WalletKey';
import { findTokenByAddress } from '../../misc/Tokens';
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
      () => this.wallet.currentAddress,
      () => this.updateSession()
    );
  }

  connect(uri: string) {
    this.connector = new WalletConnector({
      uri,
      clientMeta: {
        name: 'Wallet 3',
        description: 'A Secure Wallet for Bankless Era',
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

    console.log(this.wallet.id, 'update session', this.wallet.currentAddress);
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
      console.log('wc current addr', this.wallet.currentAddress);
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

    console.log(request.method);
    console.log(request.id);
    console.log(request.params);

    const checkAccount = (from: string) => {
      console.log('check account', from, this.wallet.currentAddress, from === this.wallet.currentAddress);
      if (from?.toLowerCase() === this.wallet.currentAddress.toLowerCase()) return true;
      this.connector.rejectRequest({ id: request.id, error: { message: 'Update session' } });
      this.updateSession();
      return false;
    };

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

      const hash = await Application.sendTx(params.chainId || this.appChainId, params, txHex);

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

    const recipient: { address: string; name: string } = this.wallet.addresses.find(
      (addr) => addr === utils.getAddress(param.to)
    )
      ? {
          address: param.to,
          name: `Account ${this.wallet.addresses.indexOf(utils.getAddress(param.to)) + 1}`,
        }
      : undefined;

    const chainId = requestedChainId || this.appChainId;
    let defaultGasPrice = chainId === 56 ? GasnowWs.gwei_5 : GasnowWs.gwei_1;
    defaultGasPrice = chainId === 1 ? Gasnow.fast : defaultGasPrice;

    App.createPopupWindow('sendTx', {
      chainId,
      from: this.wallet.currentAddress,
      accountIndex: this.wallet.currentAddressIndex,
      to: param.to,
      data: param.data || '0x',
      gas: Number.parseInt(param.gas) || 21000,
      gasPrice: Number.parseInt(param.gasPrice) || defaultGasPrice,
      nonce:
        Number.parseInt(param.nonce) ||
        (await getTransactionCount(requestedChainId ?? this.appChainId, this.wallet.currentAddress)),
      value: param.value || 0,

      recipient,
      transferToken,
      walletConnect: { peerId: this.peerId, reqid: request.id, app: this.appMeta },
    } as ConfirmSendTx);
  };

  private sign = async (request: WCCallRequestRequest, params: string[], type: 'personal_sign' | 'signTypedData') => {
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

      let signed = '';

      switch (type) {
        case 'personal_sign':
          const msg = params[0];
          signed = await this.wallet.personalSignMessage(password, this.wallet.currentAddressIndex, msg);

          if (!signed) {
            this.connector.rejectRequest({ id: request.id, error: { message: 'Permission Denied' } });
            return Application.encryptIpc({ success: false }, key);
          }

          this.connector.approveRequest({ id: request.id, result: signed });
          return Application.encryptIpc({ suceess: true }, key);
        case 'signTypedData':
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
      case 'personal_sign':
        msg = Buffer.from(utils.arrayify(params[0])).toString('utf8');
        json = false;
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

  disconnect() {
    this.connector.killSession({ message: 'User exits' });
  }

  dispose() {
    this._chainIdObserver?.();
    this._currAddrObserver?.();
    this.removeAllListeners();
    this.connector?.on('session_request', null);
    this.connector?.on('call_request', null);
    this.connector?.on('disconnect', null);

    this._chainIdObserver = undefined;
    this._currAddrObserver = undefined;
  }
}
