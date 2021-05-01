import { makeAutoObservable, reaction } from 'mobx';

import { AccountVM } from './AccountVM';
import { ITokenBalance } from '../../api/Debank';

export class TransferVM {
  private readonly _accountVM: AccountVM;

  receipt: string='';
  amount: string='';
  gas: number=100000;
  nonce: number=1;
  gasPrice: number=20;

  selectedToken: ITokenBalance = null;
  receipts: string[] = [];

  constructor(accountVM: AccountVM) {
    makeAutoObservable(this);
    this.selectedToken = accountVM.tokens[0];
    this._accountVM = accountVM;
  }

  setToken(token: ITokenBalance) {
    this.selectedToken = token;
  }
}
