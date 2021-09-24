import * as Debank from '../../api/Debank';

import { BigNumber, utils } from 'ethers';
import { IUserToken, UserToken } from './models/UserToken';
import { makeAutoObservable, runInAction } from 'mobx';

import { AddTokenVM } from './account/AddTokenVM';
import { ERC20Token } from '../../common/ERC20Token';
import { NFT } from './models/NFT';
import NetVM from './NetworksVM';
import { Networks } from '../../common/Networks';
import Notification from '../bridges/Notification';
import POAP from '../../nft/POAP';
import Rarible from '../../nft/Rarible';
import { TransferVM } from './account/TransferVM';
import { catUrl } from '../../misc/Url';
import i18n from '../../i18n';
import store from 'storejs';

const Keys = {
  userTokens: (walletId: number, chainId: number, accountIndex: number) =>
    `userTokens-w${walletId}-c${chainId}-a${accountIndex}`,
  accountName: (walletId: number, accountIndex: number) => `w_${walletId}-accountName-${accountIndex}`,
};

interface IArgs {
  address: string;
  accountIndex: number;
  walletId: number;
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
  walletId = 1;

  private _name = '';
  private tokenWatcher = new Map<string, ERC20Token>();

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
      .filter((c) => Networks.find((n) => n.comm_id === c.id && n.showOverview && !n.test))
      .map((chain) => {
        const network = Networks.find((n) => n?.comm_id === chain.id);
        return {
          name: network?.network ?? '',
          value: chain?.usd_value ?? 0,
          color: network?.color ?? '',
          order: network?.order ?? chain.community_id,
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
    store.set(Keys.accountName(this.walletId, this.accountIndex), value);
  }

  constructor(args: IArgs) {
    makeAutoObservable(this);
    this.walletId = args.walletId;
    this.address = args.address;
    this.accountIndex = args.accountIndex;
    this._name = store.get(Keys.accountName(args.walletId, this.accountIndex)) || `Account ${args.accountIndex}`;

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

  async refreshNativeToken(nativeCurrency: Debank.ITokenBalance) {
    const provider = NetVM.currentProvider;
    const rpc = provider.connection.url;
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
    nativeToken.show = true;
    nativeToken.wei = balance.toString();
    nativeToken.price = nativeCurrency?.price ?? (this.nativeToken?.price || 0);

    runInAction(() => {
      this.nativeToken = nativeToken;
      if (this.allTokens.length === 0) return;
      this.allTokens[0] = nativeToken;
    });

    return nativeToken;
  }

  refreshChainTokens = async () => {
    const nativeSymbols = Networks.map((n) => n?.symbol.toLowerCase()).concat(Networks.map((n) => n.comm_id));
    const defaultTokens = Networks.find((n) => n.chainId === NetVM.currentChainId).defaultTokens.map((t, i) =>
      new UserToken().init(t, { order: i + 1, show: false })
    );

    const tmpMap = new Map<string, UserToken>();
    this.loadTokenConfigs().map((t) => tmpMap.set(t.id.toLowerCase(), t));
    const userConfigs = Array.from(tmpMap.values());

    userConfigs.push(...defaultTokens.filter((t) => !userConfigs.find((uc) => uc.id.toLowerCase() === t.id.toLowerCase())));

    const tokens = NetVM.currentNetwork.test ? [] : await Debank.getTokenBalances(this.address, NetVM.currentNetwork.comm_id);

    let assets = NetVM.currentNetwork.test
      ? []
      : tokens
          .map((t, i) => {
            const token = new UserToken();
            token.id = t.id;
            token.name = t.name;
            token.symbol = t.symbol || t.display_symbol;
            token.amount = t.amount;
            token.decimals = t.decimals;
            token.price = t.price;
            token.order = i + 1000;
            token.show = false;

            const uc = userConfigs.find((uc) => uc.id.toLowerCase() === t.id.toLowerCase());
            if (uc) uc.price = t.price;

            return token;
          })
          .filter(
            (t) => !nativeSymbols.includes(t.id) && !userConfigs.find((uc) => uc.id.toLowerCase() === t.id.toLowerCase())
          )
          .sort((a, b) => b.amount * b.price - a.amount * a.price);

    const allTokens = [...userConfigs, ...assets]
      .filter((t) => !nativeSymbols.find((n) => n === t.id))
      .sort((a, b) => a.order - b.order);

    const nativeCurrency = tokens.find((t) => nativeSymbols.includes(t.id));
    const nativeToken = await this.refreshNativeToken(nativeCurrency);

    allTokens.unshift(nativeToken);

    runInAction(() => {
      this.allTokens = allTokens;
      this.watchTokens();
    });
  };

  watchTokens() {
    const provider = NetVM.currentProvider;
    const { network, chainId } = NetVM.currentNetwork;

    for (let t of this.allTokens.slice(1)) {
      if (this.tokenWatcher.has(t.id.toLowerCase())) {
        const erc20 = this.tokenWatcher.get(t.id.toLowerCase());
        t.amount = Number.parseFloat(utils.formatUnits(erc20.balance, t.decimals));
        continue;
      }

      const erc20 = new ERC20Token(t.id, provider);
      this.tokenWatcher.set(t.id.toLowerCase(), erc20);

      const refreshBalance = () =>
        erc20.balanceOf(this.address).then((balance) => {
          const token = this.allTokens.find((t) => t.id.toLowerCase() === erc20.address.toLowerCase());
          if (!token) return;
          runInAction(() => (token.amount = Number.parseFloat(utils.formatUnits(balance, t.decimals))));
        });

      const newTokenIncoming = (from: string, to: string, value: BigNumber) => {
        refreshBalance();

        const symbol = t.symbol;
        const decimals = t.decimals;
        const url = catUrl(chainId, `/address/${to}#tokentxns`);

        Notification.show(i18n.t('Received Token', { symbol, network: network }), {
          body: `${utils.formatUnits(value, decimals)} ${symbol} ${i18n.t('Received')}`,
          data: url,
        });
      };

      const filterTo = erc20.filters.Transfer(null, this.address);
      const filterFrom = erc20.filters.Transfer(this.address, null);
      erc20.on(filterTo, (from, to, value) => newTokenIncoming(from, to, value));
      erc20.on(filterFrom, () => refreshBalance());

      refreshBalance();
    }
  }

  loadTokenConfigs = () => {
    try {
      const json = store.get(Keys.userTokens(this.walletId, NetVM.currentChainId, this.accountIndex)) || '[]';
      const tokens = JSON.parse(json) as IUserToken[];
      return tokens.map((t) => new UserToken(t));
    } catch (error) {
      return [];
    }
  };

  save() {
    store.set(
      Keys.userTokens(this.walletId, NetVM.currentChainId, this.accountIndex),
      JSON.stringify(this.allTokens.slice(1).map((t) => t.toObject()))
    );
  }

  refreshNFTs = async () => {
    if (NetVM.currentChainId !== 1 || this.nfts?.length > 0) {
      this.nfts = [];
      return;
    }

    // const addr = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B';

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
          nft.contractType = 'Rarible';
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

  clean() {
    store.remove(Keys.accountName(this.walletId, this.accountIndex));
    store.remove(Keys.userTokens(this.walletId, NetVM.currentChainId, this.accountIndex));
  }
}
