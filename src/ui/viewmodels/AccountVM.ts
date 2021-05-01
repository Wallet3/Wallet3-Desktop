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

  private tokens: Debank.ITokenBalance[] = [];
  private chains: Debank.IChainBalance[] = [];

  get netWorth() {
    const usd = this.chains.find((c) => c.community_id === NetVM.currentChainId)?.usd_value;
    if (this.chains.length > 0 && usd === undefined) {
      return 0;
    }

    return usd;
  }

  get chainsOverview() {
    return this.chains.map((chain) => {
      const network = Networks.find((n) => n.symbol.toLowerCase() === chain.id);
      return {
        name: network.network,
        value: chain.usd_value,
        color: network.color,
      };
    });
  }

  get chainTokens() {
    return this.tokens.filter((t) => t?.chain === NetVM.currentNetwork.symbol.toLowerCase());
  }

  constructor(args: IArgs) {
    makeAutoObservable(this);

    reaction(
      () => NetVM.currentChainId,
      () => this.refreshChainTokens()
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

      runInAction(() => (this.chains = chains));
    });
  };

  private refreshChainTokens = () => {
    Debank.getTokenBalances(this.address, NetVM.currentNetwork.symbol).then((tokens) => {
      const assets = tokens
        .filter((t) => t.amount * (t.price || 0) > 1 && t.id !== 'eth')
        .sort((a, b) => b.amount * b.price - a.amount * a.price);

      const nativeToken = tokens.find((t) => t.id === 'eth');
      assets.unshift(nativeToken);

      runInAction(() => (this.tokens = assets));
    });
  };
}
