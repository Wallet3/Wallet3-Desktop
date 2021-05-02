import { makeAutoObservable, reaction, runInAction } from 'mobx';

import { AccountVM } from './AccountVM';
import { GasnowHttp } from '../../api/Gasnow';
import { ITokenBalance } from '../../api/Debank';

export class TransferVM {
  private readonly _accountVM: AccountVM;

  receipt: string = '';
  amount: string = '';
  gas: number = 100000;
  nonce: number = 1;
  gasPrice: number = 20; // Gwei

  selectedToken: ITokenBalance = null;
  receipts: string[] = [];

  rapid = 0; // Gwei
  fast = 0; // Gwei
  standard = 0; // Gwei

  constructor(accountVM: AccountVM) {
    makeAutoObservable(this);
    this.selectedToken = accountVM.tokens[0];
    this._accountVM = accountVM;

    GasnowHttp.refresh().then((value) => {
      runInAction(() => {
        this.fast = value.fast;
        this.rapid = value.rapid;
        this.standard = value.standard;
      });
    });
  }

  setToken(token: ITokenBalance) {
    this.selectedToken = token;
    this.amount = '';
  }

  selectToken(id: string) {
    const token = this._accountVM.tokens.find((t) => t.id === id);
    this.selectedToken = token ?? this._accountVM.tokens[0];
  }
}
