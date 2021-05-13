import { BigNumber, ethers } from 'ethers';
import Messages, { ConfirmSendTx, SendTxParams, WcMessages } from '../../common/Messages';
import NetworksVM, { Networks } from './NetworksVM';
import { formatEther, parseUnits } from '@ethersproject/units';
import { makeAutoObservable, runInAction } from 'mobx';

import App from './Application';
import ERC20ABI from '../../abis/ERC20.json';
import { GasnowWs } from '../../api/Gasnow';
import WalletVM from './WalletVM';
import crypto from '../bridges/Crypto';
import delay from 'delay';
import { findTokenByAddress } from '../misc/Tokens';
import { formatUnits } from 'ethers/lib/utils';
import ipc from '../bridges/IPC';

const Transfer = '0xa9059cbb';
const Approve = '0x095ea7b3';

const Methods = new Map<string, string[]>([
  ['0x', ['Transfer', 'repeat']],
  [Transfer, ['Transfer', 'repeat']],
  [Approve, ['Approve', 'shield']],
]);

export class ConfirmVM {
  args: ConfirmSendTx = null;
  method = '';
  flag = '';
  chainId = 1;
  nativeBalance = BigNumber.from(0);
  transferToken?: { symbol: string; transferAmount: BigNumber; decimals: number; to: string } = undefined;
  approveToken?: {
    symbol: string;
    decimals: number;
    spender: string;
    limitWei: BigNumber;
    limitAmount: string;
    isMax?: boolean;
  } = undefined;

  private _value: string | number = '';

  constructor(params: ConfirmSendTx) {
    makeAutoObservable(this);

    if (Methods.has(params.data?.substring(0, 10))) {
      const [method, icon] = Methods.get(params.data.substring(0, 10));
      this.method = method;
      this.flag = icon;
    } else {
      this.method = 'Contract Interaction';
      this.flag = 'edit-2';
    }

    if (params.data?.toLowerCase().startsWith(Transfer)) {
      this.transferToken = {
        symbol: '',
        transferAmount: BigNumber.from(0),
        decimals: 18,
        to: '',
      };

      this.initTransferToken(params, !params.transferToken);

      if (params.transferToken) {
        this.transferToken.decimals = params.transferToken.decimals;
        this.transferToken.symbol = params.transferToken.symbol;
      }
    } else if (params.data?.toLowerCase().startsWith(Approve)) {
      this.approveToken = { limitWei: BigNumber.from(0), spender: '', decimals: 18, symbol: '', limitAmount: '' };

      this.initApproveToken(params);
    }

    this.args = params;
    this.chainId = params.chainId;
    this._gas = params.gas;
    this._gasPrice = params.gasPrice / GasnowWs.gwei_1;
    this._nonce = params.nonce || 0;
    this._value = params.value || 0;

    NetworksVM.currentProvider
      .getBalance(params.from)
      .then((v) => runInAction(() => (this.nativeBalance = v)))
      .catch(() => console.log('balance error'));
  }

  get receipt() {
    return this.args.receipient?.name || this.args.receipient?.address || this.args.to;
  }

  get receiptAddress() {
    return this.args.receipient?.address || this.args.to;
  }

  get amount() {
    return this.transferToken ? formatUnits(this.transferToken.transferAmount, this.transferToken.decimals) : this.value;
  }

  get value() {
    return formatEther(this._value);
  }

  get totalValue() {
    return formatEther(BigNumber.from(this.args.value || 0).add(parseUnits(this.maxFee, 18)));
  }

  private _gas = 0;
  get gas() {
    return this._gas;
  }

  private _gasPrice = 0; // Gwei
  get gasPrice() {
    return this._gasPrice;
  }

  get gasPriceWei() {
    return BigNumber.from(Number.parseInt((this.gasPrice * GasnowWs.gwei_1) as any) || 0);
  }

  get tokenSymbol() {
    return (
      this.transferToken?.symbol || this.approveToken?.symbol || Networks.find((n) => n?.chainId === this.chainId).symbol
    );
  }

  private _nonce = -1;
  get nonce() {
    return this._nonce;
  }

  get maxFee() {
    return formatEther(this.gasPriceWei.mul(this.gas).toString());
  }

  get insufficientFee() {
    return this.nativeBalance.lt(this.gasPriceWei.mul(this.gas).toString());
  }

  get isValid() {
    return this.gas >= 21000 && this.gas <= 12_500_000 && this.gasPrice > 0 && this.nonce >= 0;
  }

  get data() {
    return this.args.data;
  }

  setGasPrice(value: string) {
    const price = Number.parseFloat(value) || 0;
    this._gasPrice = Math.min(price, 10000000000);
    this.args.gasPrice = this.gasPriceWei.toNumber();
  }

  setGas(value: string) {
    const max = Math.min(Number.parseInt(value) || 0, 12_000_000);
    this.args.gas = max;
    this._gas = max;
  }

  setNonce(value: string) {
    const nonce = Number.parseInt(value) || -1;
    this._nonce = nonce;
    this.args.nonce = nonce;
  }

  private async initTransferToken(params: ConfirmSendTx, needMore = true) {
    const iface = new ethers.utils.Interface(ERC20ABI);
    const { dst, wad } = iface.decodeFunctionData('transfer', params.data);

    this.transferToken.to = dst;
    this.transferToken.transferAmount = BigNumber.from(wad);

    if (!needMore) return;

    const token = findTokenByAddress(params.to);
    if (token) {
      this.transferToken.symbol = token.symbol;
      this.transferToken.decimals = token.decimals;
      return;
    }

    const c = new ethers.Contract(params.to, ERC20ABI, NetworksVM.currentProvider);
    const symbol = await c.symbol();
    const decimals: number = await c.decimals();

    runInAction(() => {
      this.transferToken.symbol = symbol;
      this.transferToken.decimals = decimals;
    });
  }

  private async initApproveToken(params: ConfirmSendTx) {
    const iface = new ethers.utils.Interface(ERC20ABI);
    const { guy, wad } = iface.decodeFunctionData('approve', params.data);

    this.approveToken.spender = guy;
    this.approveToken.limitWei = wad;
    this.approveToken.isMax = wad.eq('115792089237316195423570985008687907853269984665640564039457584007913129639935');

    const token = findTokenByAddress(params.to);
    if (token) {
      this.approveToken.symbol = token.symbol;
      this.approveToken.decimals = token.decimals;
      this.approveToken.limitAmount = formatUnits(wad, token.decimals);
      return;
    }

    const c = new ethers.Contract(params.to, ERC20ABI, NetworksVM.currentProvider);
    const symbol = await c.symbol();
    const decimals: number = await c.decimals();

    runInAction(() => {
      this.approveToken.symbol = symbol;
      this.approveToken.decimals = decimals;
      this.approveToken.limitAmount = formatUnits(wad, decimals);
    });
  }

  async approveRequest(via: 'touchid' | 'passcode', passcode?: string) {
    let verified = false;
    switch (via) {
      case 'touchid':
        verified = await App.promptTouchID('Send Tx');
        break;
      case 'passcode':
        verified = await App.verifyPassword(passcode);
        break;
    }

    if (!verified) return false;

    const params = {
      chainId: this.args.chainId,
      from: this.args.from,
      to: this.args.to,
      value: this.args.value,
      gas: this.args.gas,
      gasPrice: this.args.gasPrice, // wei
      nonce: this.args.nonce,
      data: this.args.data,

      password: via === 'passcode' ? crypto.sha256(passcode) : undefined,
      accountIndex: WalletVM.accountIndex,
      viaTouchID: via === 'touchid',
    } as SendTxParams;

    let txHex = '';
    if (this.args.walletConnect) {
      const { peerId, reqid } = this.args.walletConnect;
      txHex = await ipc.invokeSecure(`${WcMessages.approveWcCallRequest(peerId, reqid)}`, params);
    } else {
      txHex = await ipc.invokeSecure(`${Messages.sendTx}`, params);
    }

    if (txHex) {
      NetworksVM.currentProvider.sendTransaction(txHex).catch(console.error);
    }

    return true;
  }

  rejectRequest() {
    if (!this.args.walletConnect) return;
    const { peerId, reqid } = this.args.walletConnect;

    ipc.invokeSecure(`${WcMessages.rejectWcCallRequest(peerId, reqid)}`);
  }
}
