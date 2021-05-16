import * as Debank from '../../api/Debank';
import * as Zapper from '../../api/Zapper';

import NetVM, { Networks } from './NetworksVM';
import { autorun, makeAutoObservable, reaction, runInAction, when } from 'mobx';

import { TransferVM } from './TransferVM';
import { utils } from 'ethers';

interface IArgs {
  address: string;
}

interface ChainOverview {
  name: string;
  value: number;
  color: string;
}

export class AccountVM {
  address: string = '';

  tokens: Debank.ITokenBalance[] = [];
  chains: Debank.IChainBalance[] = [];

  nativeToken: Debank.ITokenBalance = null;

  get netWorth() {
    if (this.chains.length === 0) return undefined;

    const usd = this.chains.find((c) => c.community_id === NetVM.currentChainId)?.usd_value;
    if (this.chains.length > 0 && usd === undefined) {
      return 0;
    }

    return usd || 0;
  }

  get chainsOverview(): ChainOverview[] {
    return this.chains.map((chain) => {
      const network = Networks.find((n) => n?.symbol.toLowerCase() === chain.id);
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
    this.address = args.address;
  }

  refresh() {
    this.chains = [];
    this.tokens = [];
    this.nativeToken = null;

    this.refreshChainOverview();
    this.refreshChainTokens();
  }

  private refreshChainOverview = () => {
    Debank.fetchChainsOverview(this.address).then((overview) => {
      if (!overview) {
        return;
      }

      const chains = overview.chain_list.filter((c) => c.usd_value > 0);
      if (chains.length === 0) {
        overview.chain_list.forEach((c) => (c.usd_value = 0.000001));
        chains.push(...overview.chain_list);
      }

      runInAction(() => (this.chains = chains));
    });
  };

  private refreshChainTokens = () => {
    const nativeSymbols = Networks.map((n) => n?.symbol.toLowerCase());

    Debank.getTokenBalances(this.address, NetVM.currentNetwork.symbol).then(async (tokens) => {
      const assets =
        tokens
          ?.filter((t) => t.amount * (t.price || 0) > 0.1 && !nativeSymbols.includes(t.id))
          .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
          .sort((a, b) => b.amount * b.price - a.amount * a.price) ?? [];

      const nativeToken = tokens.find((t) => nativeSymbols.includes(t.id));
      if (nativeToken) {
        assets.unshift(nativeToken);
      } else {
        const balance = await NetVM.currentProvider.getBalance(this.address);
        assets.unshift({
          id: NetVM.currentNetwork.symbol.toLowerCase(),
          amount: Number.parseFloat(utils.formatEther(balance)),
          chain: NetVM.currentNetwork.symbol.toLowerCase(),
          decimals: 18,
          name: NetVM.currentNetwork.symbol,
          symbol: NetVM.currentNetwork.symbol,
          is_wallet: true,
        });
      }

      runInAction(() => {
        this.nativeToken = assets[0];
        this.tokens = assets;
      });
    });
  };
}
