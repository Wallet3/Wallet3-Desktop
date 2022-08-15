import Messages, { ConfirmSendTx } from '../../../common/Messages';

import { Gwei_1 } from '../../../gas/Gasnow';
import { Networks } from '../../../common/Networks';
import { TxParams } from '../../../common/Messages';
import ipc from '../../bridges/IPC';

export class PendingTxVM {
  _tx: TxParams;

  constructor(tx: TxParams) {
    this._tx = tx;
  }

  get chainId() {
    return this._tx.chainId;
  }

  get eip1559() {
    return Networks.find((n) => n.chainId === this.chainId).eip1559;
  }

  get hash() {
    return this._tx.hash;
  }

  get from() {
    return this._tx.from;
  }

  get to() {
    return this._tx.to;
  }

  get value() {
    return this._tx.value;
  }

  get gasPrice() {
    return this._tx.gasPrice;
  }

  get maxFeePerGas() {
    return this._tx.maxFeePerGas || this._tx.gasPrice;
  }

  get maxPriorityFeePerGas() {
    return this._tx.maxPriorityFeePerGas || this._tx.tipPrice;
  }

  get gas() {
    return this._tx.gas;
  }

  get nonce() {
    return this._tx.nonce;
  }

  get data() {
    return this._tx.data;
  }

  get status() {
    return false;
  }

  get blockNumber() {
    return 0;
  }

  async cancelTx() {
    const maxPriorityFeePerGas = this.eip1559 ? Number.parseInt((this._tx.tipPrice * 1.1) as any) + Gwei_1 : undefined;
    const maxFeePerGas = this.eip1559
      ? Math.max(maxPriorityFeePerGas, Number.parseInt((this._tx.gasPrice * 1.1) as any))
      : undefined;

    await ipc.invokeSecure<void>(Messages.createTransferTx, {
      chainId: this._tx.chainId,
      from: this._tx.from,
      to: this._tx.from,
      value: '0',
      gas: 21000,
      gasPrice: this.eip1559 ? undefined : Number.parseInt((this._tx.gasPrice * 1.11) as any) + Gwei_1,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce: this.nonce,
      data: '0x',
    } as ConfirmSendTx);
  }

  async speedUp() {
    const maxPriorityFeePerGas = this.eip1559 ? Number.parseInt((this._tx.tipPrice * 1.1) as any) + Gwei_1 : undefined;
    const maxFeePerGas = this.eip1559
      ? Math.max(maxPriorityFeePerGas, Number.parseInt((this._tx.gasPrice * 1.1) as any))
      : undefined;

    await ipc.invokeSecure<void>(Messages.createTransferTx, {
      ...this._tx,

      gasPrice: this.eip1559 ? undefined : Number.parseInt((this._tx.gasPrice * 1.11) as any) + Gwei_1,
      maxFeePerGas,
      maxPriorityFeePerGas,
    } as ConfirmSendTx);
  }
}
