import * as Debank from '../../api/Debank';
import * as Zapper from '../../api/Zapper';

import NetVM, { Networks } from './NetworksVM';
import { autorun, makeAutoObservable, reaction, runInAction, when } from 'mobx';

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
  tokens: Debank.ITokenBalance[] = [];
  chains: ChainOverview[] = [];

  constructor(args: IArgs) {
    makeAutoObservable(this);

    reaction(
      () => NetVM.currentChainId,
      (curr, prev) => console.log('networks: ', curr, prev)
    );

    this.address = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'; // args.address;
  }

  refresh() {
    this.refreshChainOverview();
    this.refreshChainTokens();
  }

  private refreshChainOverview = () => {
    Debank.fetchChainsOverview(this.address).then((overview) => {
      const chains = overview.chain_list.filter((c) => c.usd_value > 0);
      if (chains.length === 0) {
        overview.chain_list.forEach((c) => (c.usd_value = 1));
        chains.push(...overview.chain_list);
      }

      runInAction(() => {
        this.netWorth = overview.chain_list.find((c) => c.community_id === NetVM.currentChainId).usd_value;
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
  };

  private refreshChainTokens = () => {
    Debank.getTokenBalances(this.address, NetVM.currentNetwork.symbol).then((tokens) => {
      const assets = tokens
        .filter((t) => t.amount * (t.price || 0) > 1 && t.id !== 'eth')
        .sort((a, b) => a.amount * a.price - b.amount * b.price);

      const nativeToken = tokens.find((t) => t.id === 'eth');
      assets.unshift(nativeToken);

      console.log('vm', assets);

      runInAction(() => (this.tokens = assets));
    });
  };
}
