import * as Debank from '../../api/Debank';
import * as Zapper from '../../api/Zapper';

import { makeAutoObservable, runInAction } from 'mobx';

import { ITokenBalance } from '../../api/Zapper';
import { Networks } from './NetworksVM';
import delay from 'delay';
import { formatNum } from '../misc/Formatter';
import numeral from 'numeral';

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
  netWorth: number;
  tokens: Zapper.ITokenBalance[] = [];
  chains: ChainOverview[] = [];

  constructor(args: IArgs) {
    makeAutoObservable(this);

    this.address = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'; // args.address;
  }

  async refresh() {
    Debank.getTotalBalance(this.address).then((overview) => {
      const chains = overview.chain_list.filter((c) => c.usd_value > 0);
      if (chains.length === 0) {
        overview.chain_list.forEach((c) => (c.usd_value = 1));
        chains.push(...overview.chain_list);
      }

      runInAction(() => {
        this.netWorth = overview.total_usd_value;
        this.chains = chains.map((chain) => {
          const network = Networks.find((n) => n.symbol.toLowerCase() === chain.id);
          return {
            name: network.network,
            value: chain.usd_value,
            color: network.color,
          };
        });
      });
    });
  }
}
