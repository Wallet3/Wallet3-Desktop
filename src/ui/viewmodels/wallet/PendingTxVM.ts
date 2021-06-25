import Messages, { ConfirmSendTx } from '../../../common/Messages';

import { GasnowWs } from '../../../gas/Gasnow';
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
    await ipc.invokeSecure<void>(Messages.createTransferTx, {
      chainId: this._tx.chainId,
      from: this._tx.from,
      to: this._tx.from,
      value: '0',
      gas: 21000,
      gasPrice: Number.parseInt((this._tx.gasPrice * 1.1) as any) + GasnowWs.gwei_1,
      nonce: this.nonce,
      data: '0x',
    } as ConfirmSendTx);
  }

  async speedUp() {
    await ipc.invokeSecure<void>(Messages.createTransferTx, {
      ...this._tx,
      gasPrice: Number.parseInt((this._tx.gasPrice * 1.1) as any) + GasnowWs.gwei_1,
    } as ConfirmSendTx);
  }
}
