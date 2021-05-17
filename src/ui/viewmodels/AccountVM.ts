import * as Debank from '../../api/Debank';
import * as Zapper from '../../api/Zapper';

import { IUserToken, UserToken } from './models/UserToken';
import NetVM, { Networks } from './NetworksVM';
import { autorun, makeAutoObservable, reaction, runInAction, when } from 'mobx';

import { TransferVM } from './TransferVM';
import store from 'storejs';
import { utils } from 'ethers';

const Keys = {
  userTokens: (chainId: number) => `${chainId}-tokens`,
};

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
  ens = '';

  allTokens: UserToken[] = [];
  chains: Debank.IChainBalance[] = [];

  nativeToken: UserToken = null;

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
    return this.allTokens;
  }

  get transferVM() {
    return new TransferVM(this);
  }

  constructor(args: IArgs) {
    makeAutoObservable(this);
    this.address = args.address;
    NetVM.currentProvider.lookupAddress(this.address).then((v) => runInAction(() => (this.ens = v)));
  }

  refresh() {
    this.chains = [];
    this.allTokens = [];
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
      const assets = tokens
        .filter((t) => t.amount * (t.price || 0) > 0.1 && !nativeSymbols.includes(t.id))
        .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
        .sort((a, b) => b.amount * b.price - a.amount * a.price)
        .map((t) => {
          const token = new UserToken();
          token.id = t.id;
          token.name = t.name;
          token.symbol = t.display_symbol || t.symbol;
          token.amount = t.amount;
          token.decimals = t.decimals;
          token.price = t.price;
          return token;
        });

      const nativeT = tokens.find((t) => nativeSymbols.includes(t.id));
      const balance = await NetVM.currentProvider.getBalance(this.address);
      const nativeToken = new UserToken();
      nativeToken.id = NetVM.currentNetwork.symbol.toLowerCase();
      nativeToken.amount = Number.parseFloat(utils.formatEther(balance));
      nativeToken.decimals = 18;
      nativeToken.name = NetVM.currentNetwork.symbol;
      nativeToken.symbol = NetVM.currentNetwork.symbol;
      nativeToken.wei = balance.toString();
      nativeToken.price = nativeT?.price ?? 0;
      assets.unshift(nativeToken);

      runInAction(() => {
        this.nativeToken = nativeToken;
        this.allTokens = assets;
      });
    });
  };

  private loadTokenConfigs = () => {
    try {
      const json = store.get(Keys.userTokens(NetVM.currentChainId)) || '[]';
      const tokens = JSON.parse(json) as IUserToken[];
      return tokens.map((t) => new UserToken(t));
    } catch (error) {
      return [];
    }
  };
}
