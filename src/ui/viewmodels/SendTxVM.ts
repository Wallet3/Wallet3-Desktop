import { CreateSendTx } from '../../common/Messages';
import { makeAutoObservable } from 'mobx';

export class SendTxVM {
  args: CreateSendTx;

  constructor(args: CreateSendTx) {
    makeAutoObservable(this);

    this.args = args;
  }
}
