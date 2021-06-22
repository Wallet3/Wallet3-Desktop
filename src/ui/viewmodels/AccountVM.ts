import * as Debank from '../../api/Debank';

import { BigNumber, utils } from 'ethers';
import { IUserToken, UserToken } from './models/UserToken';
import NetVM, { Networks } from './NetworksVM';
import { makeAutoObservable, runInAction } from 'mobx';

import { AddTokenVM } from './account/AddTokenVM';
import { NFT } from './models/NFT';
import POAP from '../../nft/POAP';
import Rarible from '../../nft/Rarible';
import { TransferVM } from './account/TransferVM';
import WalletVM from './WalletVM';
import delay from 'delay';
import store from 'storejs';

const Keys = {
  userTokens: (chainId: number, accountIndex: number) => `userTokens-${chainId}-${accountIndex}`,
  accountName: (walletId: number, accountIndex: number) => `w_${walletId}-accountName-${accountIndex}`,
};

interface IArgs {
  address: string;
  accountIndex: number;
}

interface ChainOverview {
  name: string;
  value: number;
  color: string;
}

export class AccountVM {
  address: string = '';
  ens = '';
  accountIndex = -1;

  allTokens: UserToken[] = [];
  nfts: NFT[] = null;
  chains: Debank.IChainBalance[] = [];
  nativeToken: UserToken = null;

  private _name = '';

  get netWorth() {
    if (this.chains.length === 0) return undefined;

    const usd = this.chains.find((c) => c.community_id === NetVM.currentChainId)?.usd_value;
    if (this.chains.length > 0 && usd === undefined) {
      return 0;
    }

    return usd || 0;
  }

  get chainsOverview(): ChainOverview[] {
    return this.chains
      .filter((c) => Networks.find((n) => n?.symbol.toLowerCase() === c.id)) // Filter supported chains
      .map((chain) => {
        const network = Networks.find((n) => n?.symbol.toLowerCase() === chain.id);
        return {
          name: network?.network ?? '',
          value: chain?.usd_value ?? 0,
          color: network?.color ?? '',
          order: network.order ?? chain.community_id,
        };
      })
      .sort((a, b) => a.order - b.order);
  }

  get chainTokens() {
    return this.allTokens.filter((t) => t.show);
  }

  get transferVM() {
    return new TransferVM(this);
  }

  get addTokenVM() {
    return new AddTokenVM(this);
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = value;
    store.set(Keys.accountName(WalletVM.id, this.accountIndex), value);
  }

  constructor(args: IArgs) {
    makeAutoObservable(this);
    this.address = args.address;
    this.accountIndex = args.accountIndex;
    this._name = store.get(Keys.accountName(WalletVM.id, this.accountIndex)) || `Account ${args.accountIndex}`;

    NetVM.currentProvider
      .lookupAddress(this.address)
      .then((v) => runInAction(() => (this.ens = v)))
      .catch(() => {});
  }

  async refresh() {
    this.chains = [];
    this.nativeToken = null;
    this.allTokens = [];

    try {
      await Promise.all([this.refreshChainOverview(), this.refreshChainTokens()]);
    } catch (error) {
      await this.refreshChainTokens();
    }

    this.refreshNFTs();
  }

  moveToken(srcIndex: number, dstIndex: number) {
    if (srcIndex === 0 || dstIndex === 0) return;

    const [srcToken] = this.allTokens.splice(srcIndex, 1);
    this.allTokens.splice(dstIndex, 0, srcToken);
    this.allTokens.forEach((t, i) => (t.order = i + 1));

    this.save();
  }

  save() {
    store.set(
      Keys.userTokens(NetVM.currentChainId, this.accountIndex),
      JSON.stringify(this.allTokens.slice(1).map((t) => t.toObject()))
    );
  }

  refreshChainOverview = async () => {
    const overview = await Debank.fetchChainsOverview(this.address);
    if (!overview) {
      runInAction(() => (this.chains = []));
      return;
    }

    const chains = overview.chain_list.filter((c) => c.usd_value > 0);
    if (chains.length === 0) {
      overview.chain_list.forEach((c) => (c.usd_value = 0.000001));
      chains.push(...overview.chain_list);
    }

    runInAction(() => (this.chains = chains));
  };

  refreshChainTokens = async () => {
    const nativeSymbols = Networks.map((n) => n?.symbol.toLowerCase());
    const userConfigs = this.loadTokenConfigs();

    const tokens = await Debank.getTokenBalances(this.address, NetVM.currentNetwork.symbol);

    let assets = NetVM.currentNetwork.test
      ? []
      : tokens
          .filter((t) => t.amount * (t.price || 0) > 0.1 && !nativeSymbols.includes(t.id))
          .sort((a, b) => b.amount * b.price - a.amount * a.price)
          .map((t, i) => {
            const token = new UserToken();
            token.id = t.id;
            token.name = t.name;
            token.symbol = t.display_symbol || t.symbol;
            token.amount = t.amount;
            token.decimals = t.decimals;
            token.price = t.price;

            const userConfig = userConfigs.find((c) => c.id === t.id);
            token.order = userConfig?.order ?? i + 1000;
            token.show = userConfig?.show ?? true;

            const foundIndex = userConfigs.findIndex((c) => c.id === t.id);
            if (foundIndex >= 0) userConfigs.splice(foundIndex, 1);

            return token;
          });

    assets.push(...userConfigs);

    const defaultTokens = Networks.find((n) => n.chainId === NetVM.currentChainId).defaultTokens.map((t, i) =>
      new UserToken().init(t, i + 1)
    );

    defaultTokens.forEach((t) => {
      const token = assets.find((ut) => ut.id.toLowerCase() === t.id.toLowerCase());
      if (token) token.symbol = t.symbol;
    });

    assets.push(...defaultTokens.filter((dt) => !assets.find((ut) => dt.id.toLowerCase() === ut.id.toLowerCase())));

    assets = assets.sort((a, b) => a.order - b.order);

    const nativeCurrency = tokens.find((t) => nativeSymbols.includes(t.id));

    const rpc = NetVM.currentProvider.connection.url;
    const network = NetVM.currentChainId;
    const balancePromise = NetVM.currentProvider.getBalance(this.address);
    balancePromise.catch(() => NetVM.reportFailedRpc(network, rpc));

    const balance = await balancePromise;
    const nativeToken = new UserToken();
    nativeToken.id = NetVM.currentNetwork.symbol.toLowerCase();
    nativeToken.amount = Number.parseFloat(utils.formatEther(balance));
    nativeToken.decimals = 18;
    nativeToken.name = NetVM.currentNetwork.symbol;
    nativeToken.symbol = NetVM.currentNetwork.symbol;
    nativeToken.wei = balance.toString();
    nativeToken.price = nativeCurrency?.price ?? 0;
    assets.unshift(nativeToken);

    runInAction(() => {
      this.nativeToken = nativeToken;
      this.allTokens = assets;
    });
  };

  private loadTokenConfigs = () => {
    try {
      const json = store.get(Keys.userTokens(NetVM.currentChainId, this.accountIndex)) || '[]';
      const tokens = JSON.parse(json) as IUserToken[];
      return tokens.map((t) => new UserToken(t));
    } catch (error) {
      return [];
    }
  };

  refreshNFTs = async () => {
    if (NetVM.currentChainId !== 1 || this.nfts?.length > 0) {
      this.nfts = [];
      return;
    }

    const addr = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B';

    const poap = POAP.getNFTs(this.address).then(async (data) => {
      const nfts = data.map((item) => {
        const nft = new NFT();
        nft.tokenId = item.tokenId;
        nft.tokenURI = item.tokenURI;
        nft.image_url = item.metadata.image_url;
        nft.name = item.metadata.name;
        nft.description = item.metadata.description;
        nft.contract = item.contract;
        nft.contractType = 'standard';
        return nft;
      });

      return nfts;
    });

    const rarible = Rarible.getItemsByOwner(this.address).then(async (items) => {
      const nfts = items
        .map((item) => {
          const nft = new NFT();
          nft.tokenId = BigNumber.from(item.tokenId);
          nft.contract = item.contract;
          nft.description = item.description;
          nft.name = item.name;
          nft.image_url = item.image?.url.BIG;
          nft.contractType = 'rariable';
          return nft.image_url ? nft : undefined;
        })
        .filter((i) => i);

      return nfts;
    });

    let nfts = (await Promise.all([poap, rarible])).flat();
    nfts = nfts.filter(
      (item, index) =>
        index ===
        nfts.findIndex((i) => i.contract?.toLowerCase() === item.contract.toLowerCase() && i.tokenId.eq(item.tokenId))
    );

    runInAction(() => {
      this.nfts = this.nfts ?? [];
      this.nfts.push(...nfts);
    });
  };
}
