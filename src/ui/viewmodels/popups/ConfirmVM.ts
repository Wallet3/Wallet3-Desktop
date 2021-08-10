import { BigNumber, ethers, utils } from 'ethers';
import Messages, { ConfirmSendTx, SendTxParams, WcMessages } from '../../../common/Messages';
import { formatEther, parseUnits } from '@ethersproject/units';
import { getProviderByChainId, markRpcFailed } from '../../../common/Provider';
import { makeAutoObservable, runInAction } from 'mobx';

import App from '../ApplicationPopup';
import ERC20ABI from '../../../abis/ERC20.json';
import { Gwei_1 } from '../../../gas/Gasnow';
import KnownAddresses from '../../misc/KnownAddresses';
import { Networks } from '../../../misc/Networks';
import NetworksVM from '../NetworksVM';
import { fetchNextBlockFeeData } from '../services/EIP1559';
import { findTokenByAddress } from '../../../misc/Tokens';
import { formatUnits } from 'ethers/lib/utils';
import i18n from '../../../i18n';
import ipc from '../../bridges/IPC';

const Transfer = '0xa9059cbb';
const Approve = '0x095ea7b3';

type Method = 'Contract Interaction' | 'Transfer' | 'Approve' | '';

const Methods = new Map<string, [Method, string]>([
  ['0x', ['Transfer', 'repeat']],
  [Transfer, ['Transfer', 'repeat']],
  [Approve, ['Approve', 'shield']],
]);

export class ConfirmVM {
  args: ConfirmSendTx = null;
  method: Method = '';
  flag = '';
  chainId = 1;
  accountIndex = -1;
  nativeBalance = BigNumber.from(0);
  transferToken?: { symbol: string; transferAmount: BigNumber; decimals: number; to: string } = undefined;
  nextBlockBaseFee = 0;
  suggestedPriorityFee = 0;
  approveToken?: {
    symbol: string;
    decimals: number;
    spender: string;
    limitWei: BigNumber;
    limitAmount: string;
    isMax?: boolean;
    iface?: ethers.utils.Interface;
  } = undefined;

  get eip1559() {
    return Networks.find((n) => n.chainId === this.args.chainId).eip1559;
  }

  private _provider: ethers.providers.JsonRpcProvider;
  private _value: string | number = '';
  private _data: string = '';

  constructor(params: ConfirmSendTx) {
    makeAutoObservable(this);

    this._provider = getProviderByChainId(params.chainId);
    this.refreshBalance(params.from, params.chainId);

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
    this.accountIndex = params.accountIndex;
    this._gas = params.gas;
    this._gasPrice = (params.gasPrice || 0) / Gwei_1;
    this._maxFeePerGas = (params.maxFeePerGas || 0) / Gwei_1;
    this._priorityPrice = (params.maxPriorityFeePerGas || 0) / Gwei_1;
    this._nonce = params.nonce || 0;
    this._value = Number(params.value) === 0 ? 0 : params.value || 0;
    this._data = params.data;

    if (!this.eip1559) return;

    const refreshBaseFee = async () => {
      const { nextBlockBaseFee, suggestedPriorityFee } = await fetchNextBlockFeeData(this.chainId);

      runInAction(() => {
        this.nextBlockBaseFee = nextBlockBaseFee;
        this.suggestedPriorityFee = suggestedPriorityFee;
      });
    };

    refreshBaseFee();
    this._provider.on('block', () => refreshBaseFee());
  }

  get recipient() {
    return this.args.recipient?.name;
  }

  get verifiedName(): string {
    try {
      return (
        KnownAddresses[this.approveToken?.spender] ||
        KnownAddresses[this.transferToken?.to] ||
        KnownAddresses[utils.getAddress(this.args.to)]
      );
    } catch (error) {
      return undefined;
    }
  }

  get recipientAddress() {
    return this.args.recipient?.address;
  }

  get to() {
    return this.args.to;
  }

  get amount() {
    return this.transferToken ? formatUnits(this.transferToken.transferAmount, this.transferToken.decimals) : this.value;
  }

  get value() {
    return formatEther(this._value);
  }

  get totalValue() {
    return formatEther(BigNumber.from(this._value || 0).add(parseUnits(this.maxFee, 18)));
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
    return BigNumber.from(`${Number.parseInt((this.gasPrice * Gwei_1) as any) || 0}`);
  }

  private _maxFeePerGas = 0; //Gwei
  get maxFeePerGas() {
    return this._maxFeePerGas;
  }

  get maxFeePerGas_Wei() {
    return BigNumber.from(`${Number.parseInt((this.maxFeePerGas * Gwei_1) as any) || 0}`);
  }

  private _priorityPrice = 0; // Gwei
  get priorityPrice() {
    return this._priorityPrice;
  }

  get priorityPrice_Wei() {
    return BigNumber.from(`${Number.parseInt((this.priorityPrice * Gwei_1) as any) || 0}`);
  }

  get tokenSymbol() {
    return this.transferToken?.symbol || this.approveToken?.symbol || Networks.find((n) => n.chainId === this.chainId).symbol;
  }

  get networkSymbol() {
    return Networks.find((c) => c.chainId === this.chainId).symbol ?? 'ETH';
  }

  private _nonce = -1;
  get nonce() {
    return this._nonce;
  }

  get maxFee() {
    const eip1559Fee = Math.min(
      this.maxFeePerGas_Wei.toNumber(),
      this.priorityPrice_Wei.add(this.nextBlockBaseFee).toNumber()
    );

    return this.eip1559 ? formatEther(eip1559Fee * this.gas) : formatEther(this.gasPriceWei.mul(this.gas).toString());
  }

  get insufficientFee() {
    // this._value stands for native asset (in wei)
    return this.nativeBalance.lt(this.gasPriceWei.mul(this.gas).add(this._value));
  }

  get isValid() {
    const validGasPrice = this.maxFeePerGas_Wei.gt(0)
      ? this.maxFeePerGas_Wei.gt(0) && this.priorityPrice_Wei.gt(0) && this.maxFeePerGas_Wei.gte(this.priorityPrice_Wei)
      : this.gasPrice > 0;

    return (
      this.gas >= 21000 &&
      this.gas <= 12_500_000 &&
      validGasPrice &&
      this.nonce >= 0 &&
      this.data &&
      this.nativeBalance.gte(utils.parseEther(this.totalValue))
    );
  }

  get data() {
    return this._data;
  }

  set data(value: string) {
    this._data = value;
    this.args.data = value;
  }

  setGasPrice(value: string) {
    const price = Number.parseFloat(value) || 0;
    this._gasPrice = Math.min(price, 10000000000);
    this.args.gasPrice = this.gasPriceWei.toNumber();
  }

  setMaxGasPrice(value: string) {
    this._maxFeePerGas = Number.parseFloat(value) || 0;
    this.args.maxFeePerGas = this.maxFeePerGas_Wei.toNumber();
  }

  setPriorityPrice(value: string) {
    this._priorityPrice = Number.parseFloat(value) || 0;
    this.args.maxPriorityFeePerGas = this.priorityPrice_Wei.toNumber();
  }

  setGas(value: string) {
    const max = Math.min(Number.parseInt(value) || 0, 15_000_000);
    this.args.gas = max;
    this._gas = max;
  }

  setApproveAmount(value: string) {
    try {
      const wad = utils.parseUnits(value || '', this.approveToken.decimals);
      const data = this.approveToken.iface?.encodeFunctionData('approve', [this.approveToken.spender, wad.toString()]);
      this.data = data;
      this.approveToken.limitAmount = utils.formatUnits(wad, this.approveToken.decimals);
    } catch (error) {
      this.data = '';
    }
  }

  setNonce(value: string) {
    const nonce = Number.parseInt(value) || -1;
    this._nonce = nonce;
    this.args.nonce = nonce;
  }

  private refreshBalance(address: string, chainId: number) {
    this._provider
      .getBalance(address)
      .then((v) => runInAction(() => (this.nativeBalance = v)))
      .catch(() => {
        markRpcFailed(chainId, this._provider.connection.url);
        this._provider = getProviderByChainId(chainId);
        this.refreshBalance(address, chainId);
      });
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

    const c = new ethers.Contract(params.to, ERC20ABI, this._provider);
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

    this.approveToken.iface = iface;
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

    try {
      const c = new ethers.Contract(params.to, ERC20ABI, this._provider);
      const [symbol, decimals] = await Promise.all([c.symbol(), c.decimals()]);

      runInAction(() => {
        this.approveToken.symbol = symbol;
        this.approveToken.decimals = decimals;
        this.approveToken.limitAmount = formatUnits(wad, decimals);
      });
    } catch (error) {
      runInAction(() => (this.approveToken.limitAmount = formatUnits(wad, 18)));
    }
  }

  async approveRequest(via: 'touchid' | 'passcode', passcode?: string) {
    let verified = false;
    switch (via) {
      case 'touchid':
        verified = await App.promptTouchID(i18n.t('Send Transaction'));
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
      value: this._value,
      gas: this.args.gas,
      gasPrice: this.eip1559 ? undefined : this.args.gasPrice, // wei
      maxFeePerGas: this.eip1559 ? this.args.maxFeePerGas : undefined, // wei
      maxPriorityFeePerGas: this.eip1559 ? this.args.maxPriorityFeePerGas : undefined, // wei

      nonce: this.args.nonce,
      data: this.args.data,

      password: via === 'passcode' ? App.hashPassword(passcode) : undefined,
      viaTouchID: via === 'touchid',
    } as SendTxParams;

    if (this.args.walletConnect) {
      const { peerId, reqid } = this.args.walletConnect;
      ipc.invokeSecure(`${WcMessages.approveWcCallRequest(peerId, reqid)}`, params);
    } else {
      ipc.invokeSecure(`${Messages.sendTx}`, params);
    }

    return true;
  }

  rejectRequest() {
    if (!this.args.walletConnect) return;
    const { peerId, reqid } = this.args.walletConnect;

    ipc.invokeSecure(`${WcMessages.rejectWcCallRequest(peerId, reqid)}`);
  }
}
