import { BigNumber, utils } from 'ethers';

import { CreateTransferTx } from '../../common/Messages';
import { GasnowWs } from '../../api/Gasnow';
import { makeAutoObservable } from 'mobx';
import { parseUnits } from '@ethersproject/units';

export class ConfirmVM {
  args: CreateTransferTx = null;

  constructor(args: CreateTransferTx) {
    makeAutoObservable(this);

    this.args = args;
    this._gas = args.gas;
    this._gasPrice = args.gasPrice / GasnowWs.gwei_1;
    this._nonce = args.nonce;
  }

  get receipt() {
    return this.args.receipt?.name ?? this.args.receipt?.address ?? this.args.to;
  }

  get receiptAddress() {
    return this.args.receipt.address || this.args.to;
  }

  get amount() {
    return utils.formatUnits(this.args.value || this.args.token.amount, this.args.token.decimals);
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
    return BigNumber.from(this.args.nativeToken?.amount ?? 0).lt(
      (BigInt(this.gasPrice * GasnowWs.gwei_1) * BigInt(this.gas)).toString()
    );
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
