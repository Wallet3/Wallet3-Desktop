import { ethers, utils } from 'ethers';
import { makeAutoObservable, runInAction } from 'mobx';

import { AccountVM } from './AccountVM';
import ERC20ABI from '../../abis/ERC20.json';
import NetworksVM from './NetworksVM';
import { UserToken } from './models/UserToken';

export class AddTokenVM {
  loading = false;
  isValid = false;

  tokenAddress = '';
  balance = '';
  name = '';
  decimals = 0;
  symbol = '';

  private accountVM: AccountVM;

  constructor(accountVM: AccountVM) {
    makeAutoObservable(this);

    this.accountVM = accountVM;
  }

  async inputAddress(value: string) {
    if (!utils.isAddress(value)) return;
    if (this.loading) return;

    this.loading = true;
    this.balance = '';
    this.name = '';
    this.decimals = 0;
    this.symbol = '';
    this.tokenAddress = value;

    try {
      const erc20 = new ethers.Contract(value, ERC20ABI, NetworksVM.currentProvider);
      const [balance, name, decimals, symbol] = await Promise.all([
        erc20.balanceOf(this.accountVM.address),
        erc20.name(),
        erc20.decimals(),
        erc20.symbol(),
      ]);

      runInAction(() => {
        this.balance = ethers.utils.formatUnits(balance, decimals);
        this.name = name;
        this.decimals = decimals.toNumber();
        this.symbol = symbol;
      });
    } catch (error) {
      runInAction(() => (this.isValid = false));
    } finally {
      runInAction(() => (this.loading = false));
    }
  }

  save() {
    const token = new UserToken();
    token.decimals = this.decimals;
    token.symbol = this.symbol;
    token.name = this.name;
    token.order = 1000;
    token.id = this.tokenAddress;
    token.show = true;
    token.amount = Number.parseFloat(this.balance);

    this.accountVM.allTokens.push(token);
    this.accountVM.save();
  }
}
