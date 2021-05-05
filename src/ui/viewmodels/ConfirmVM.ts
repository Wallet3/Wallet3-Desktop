import { BigNumber, ethers, utils } from 'ethers';
import { formatEther, parseUnits } from '@ethersproject/units';
import { makeAutoObservable, runInAction } from 'mobx';

import { CreateTransferTx } from '../../common/Messages';
import ERC20ABI from '../../abis/ERC20.json';
import { GasnowWs } from '../../api/Gasnow';
import { Networks } from './NetworksVM';
import { formatUnits } from 'ethers/lib/utils';
import provider from '../../common/Provider';

const Methods = new Map<string, string[]>([
  ['0xa9059cbb', ['Transfer', 'repeat']],
  ['0x', ['Transfer', 'repeat']],
  ['0x095ea7b3', ['Approve', 'shield']],
]);

export class ConfirmVM {
  args: CreateTransferTx = null;
  method = '';
  flag = '';
  chainId = 1;
  nativeBalance = BigNumber.from(0);
  transferToken: { symbol: string; transferAmount: BigNumber; decimals: number; to: string } = undefined;

  private _value = '';

  constructor(args: CreateTransferTx) {
    makeAutoObservable(this);

    if (Methods.has(args.data?.substring(0, 10))) {
      const [method, icon] = Methods.get(args.data.substring(0, 10));
      this.method = method;
      this.flag = icon;
    } else {
      this.method = 'Contract Interaction';
      this.flag = 'edit-2';
    }

    if (args.data?.toLowerCase().startsWith('0xa9059cbb')) {
      this.transferToken = {
        symbol: '',
        transferAmount: BigNumber.from(0),
        decimals: 18,
        to: '',
      };

      this.initTransferToken(args, !args.transferToken);

      if (args.transferToken) {
        this.transferToken.decimals = args.transferToken.decimals;
        this.transferToken.symbol = args.transferToken.symbol;
      }
    }

    this.args = args;
    this.chainId = args.chainId;
    this._gas = args.gas;
    this._gasPrice = args.gasPrice / GasnowWs.gwei_1;
    this._nonce = args.nonce;
    this._value = args.value;

    provider
      .getBalance(args.from)
      .then((v) => runInAction(() => (this.nativeBalance = v)))
      .catch(() => console.log('balance error'));
  }

  get receipt() {
    return this.args.receipient?.name ?? this.args.receipient?.address ?? this.args.to;
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
    return formatEther(BigNumber.from(this.args.value).add(parseUnits(this.maxFee, 18)));
  }

  private _gas = 0;
  get gas() {
    return this._gas;
  }

  private _gasPrice = 0;
  get gasPrice() {
    return this._gasPrice;
  }

  get tokenSymbol() {
    return this.transferToken?.symbol ?? Networks.find((n) => n.chainId === this.chainId).symbol;
  }

  private _nonce = -1;
  get nonce() {
    return this._nonce;
  }

  get maxFee() {
    return formatEther((BigInt(this.gasPrice * GasnowWs.gwei_1 || 0) * BigInt(this.gas || 0)).toString());
  }

  get insufficientFee() {
    return this.nativeBalance.lt((BigInt(this.gasPrice * GasnowWs.gwei_1) * BigInt(this.gas)).toString());
  }

  get isValid() {
    return this.gas >= 21000 && this.gas <= 12_500_000 && this.gasPrice > 0 && this.nonce >= 0;
  }

  get data() {
    return this.args.data;
  }

  setGasPrice(value: string) {
    const price = Number.parseFloat(value);
    this._gasPrice = price;
    this.args.gasPrice = price * GasnowWs.gwei_1;
  }

  setGas(value: string) {
    const max = Number.parseInt(value);
    this.args.gas = max;
    this._gas = max;
  }

  setNonce(value: string) {
    const nonce = Number.parseInt(value);
    this._nonce = nonce;
    this.args.nonce = nonce;
  }

  async initTransferToken(params: CreateTransferTx, needMore = true) {
    const c = new ethers.Contract(params.to, ERC20ABI, provider);
    const iface = new ethers.utils.Interface(ERC20ABI);
    const { dst, wad } = iface.decodeFunctionData('transfer', params.data);

    this.transferToken.to = dst;
    this.transferToken.transferAmount = BigNumber.from(wad);

    if (!needMore) return;

    const symbol = await c.symbol();
    const decimals: number = await c.decimals();

    runInAction(() => {
      this.transferToken.symbol = symbol;
      this.transferToken.decimals = decimals;
    });
  }
}
