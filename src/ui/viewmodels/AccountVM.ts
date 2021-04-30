import * as Zapper from '../../api/Zapper';

import { makeAutoObservable } from 'mobx';

interface IArgs {
  address: string;
}

export class AccountVM {
  address: string;
  balance: string;

  constructor(args: IArgs) {
    makeAutoObservable(this);

    this.address = args.address;
  }

  async refresh() {
    const balances = await Zapper.getTokenBalances(this.address);
  }
}
