import { BigNumber, utils } from 'ethers';
import { makeAutoObservable, runInAction } from 'mobx';

import { CreateTransferTx } from '../../common/Messages';
import { GasnowWs } from '../../api/Gasnow';
import { parseUnits } from '@ethersproject/units';
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
  nativeBalance = BigNumber.from(0);

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

    this.args = args;
    this._gas = args.gas;
    this._gasPrice = args.gasPrice / GasnowWs.gwei_1;
    this._nonce = args.nonce;

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
    return utils.formatUnits(this.args.token.amount, this.args.token.decimals);
  }

  get value() {
    return utils.formatEther(this.args.value);
  }

  get totalValue() {
    return utils.formatEther(BigNumber.from(this.args.value).add(parseUnits(this.maxFee, 18)));
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
    return this.args.token.symbol;
  }

  private _nonce = -1;
  get nonce() {
    return this._nonce;
  }

  get maxFee() {
    return utils.formatEther((BigInt(this.gasPrice * GasnowWs.gwei_1 || 0) * BigInt(this.gas || 0)).toString());
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
}
