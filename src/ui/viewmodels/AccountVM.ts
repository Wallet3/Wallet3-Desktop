import * as Zapper from '../../api/Zapper';

import { makeAutoObservable, runInAction } from 'mobx';

import { ITokenBalance } from '../../api/Zapper';

interface IArgs {
  address: string;
}

export class AccountVM {
  address: string;
  balance: string;
  tokens: ITokenBalance[];

  constructor(args: IArgs) {
    makeAutoObservable(this);

    this.address = args.address;
  }

  async refresh() {
    const balances = await Zapper.getTokenBalances(this.address);
    runInAction(() => (this.tokens = balances));
  }
}
