import * as Debank from '../../api/Debank';
import * as Zapper from '../../api/Zapper';

import { makeAutoObservable, runInAction } from 'mobx';

import { ITokenBalance } from '../../api/Zapper';
import { Networks } from './NetworksVM';
import delay from 'delay';

interface IArgs {
  address: string;
}

interface ChainOverview {
  name: string;
  value: number;
  color: string;
}

export class AccountVM {
  address: string;
  balance: string;
  tokens: Zapper.ITokenBalance[] = [];
  chains: ChainOverview[] = [];

  constructor(args: IArgs) {
    makeAutoObservable(this);

    this.address = args.address;
  }

  async refresh() {
    Debank.getTotalBalance(this.address).then((overview) => {
      runInAction(() => {
        this.chains = overview.chain_list.map((chain) => {
          const network = Networks.find((n) => n.symbol.toLowerCase() === chain.id);
          return {
            name: network.network,
            value: chain.usd_value || 1,
            color: network.color,
          };
        });
      });
    });
  }
}
