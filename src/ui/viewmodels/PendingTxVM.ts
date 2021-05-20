import { TxParams } from '../../common/Messages';

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

  get gasLimit() {
    return this._tx.gas;
  }

  get nonce() {
    return this._tx.nonce;
  }
  
  get data() {
    return this._tx.data;
  }
}
