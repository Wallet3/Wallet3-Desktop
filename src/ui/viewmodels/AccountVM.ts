import * as Debank from '../../api/Debank';
import * as Zapper from '../../api/Zapper';

import NetVM, { Networks } from './NetworksVM';
import { autorun, makeAutoObservable, reaction, runInAction, when } from 'mobx';

import { TransferVM } from './TransferVM';
import provider from '../../common/Provider';

interface IArgs {
  address: string;
  // chainId: number;
}

interface ChainOverview {
  name: string;
  value: number;
  color: string;
}

export class AccountVM {
  address: string = '';
  chainId = 1;

  tokens: Debank.ITokenBalance[] = [];
  chains: Debank.IChainBalance[] = [];

  nativeToken: Debank.ITokenBalance;

  get netWorth() {
    const usd = this.chains.find((c) => c.community_id === NetVM.currentChainId)?.usd_value;
    if (this.chains.length > 0 && usd === undefined) {
      return 0;
    }

    return usd;
  }

  get chainsOverview(): ChainOverview[] {
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
    return this.tokens.filter((t) => t?.is_wallet && t?.chain === NetVM.currentNetwork.symbol.toLowerCase());
  }

  get transferVM() {
    return new TransferVM(this);
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
    const nativeSymbols = Networks.map((n) => n.symbol.toLowerCase());

    Debank.getTokenBalances(this.address, NetVM.currentNetwork.symbol).then((tokens) => {
      const assets = tokens
        .filter((t) => t.amount * (t.price || 0) > 0.1 && !nativeSymbols.includes(t.id))
        .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
        .sort((a, b) => b.amount * b.price - a.amount * a.price);

      const nativeToken = tokens.find((t) => nativeSymbols.includes(t.id));
      if (nativeToken) {
        assets.unshift(nativeToken);
        this.nativeToken = nativeToken;
      }

      runInAction(() => (this.tokens = assets));
    });
  };
}
