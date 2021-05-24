import { ethers, utils } from 'ethers';
import { makeAutoObservable, runInAction } from 'mobx';

import { AccountVM } from './AccountVM';
import ERC20ABI from '../../abis/ERC20.json';
import MKRABI from '../../abis/MKR.json';
import NetworksVM from './NetworksVM';
import { UserToken } from './models/UserToken';

function hex2str(hex: string) {
  var hex = hex.toString(); //force conversion
  var str = '';
  for (var i = 0; i < hex.length && hex.substr(i, 2) !== '00'; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

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

  async inputAddress(addr: string) {
    if (!utils.isAddress(addr)) return;
    if (this.loading) return;

    this.loading = true;
    this.balance = '';
    this.name = '';
    this.decimals = 0;
    this.symbol = '';
    this.tokenAddress = addr;

    const isMKR = addr.toLowerCase() === '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2';

    try {
      const erc20 = new ethers.Contract(addr, isMKR ? MKRABI : ERC20ABI, NetworksVM.currentProvider);
      let [balance, name, decimals, symbol] = await Promise.all([
        erc20.balanceOf(this.accountVM.address),
        erc20.name(),
        erc20.decimals(),
        erc20.symbol(),
      ]);

      if (isMKR) {
        name = hex2str(name.substring(2));
        symbol = hex2str(symbol.substring(2));
      }

      runInAction(() => {
        this.balance = ethers.utils.formatUnits(balance, decimals);
        this.name = name;
        this.decimals = Number.parseInt(decimals);
        this.symbol = symbol;
        this.isValid = true;
      });
    } catch (error) {
      console.log(error);
      runInAction(() => (this.isValid = false));
    } finally {
      runInAction(() => (this.loading = false));
    }
  }

  save() {
    if (this.accountVM.allTokens.find((t) => t.id.toLowerCase() === this.tokenAddress.toLowerCase())) {
      return;
    }

    const token = new UserToken();
    token.decimals = this.decimals;
    token.symbol = this.symbol;
    token.name = this.name;
    token.order = 1000 + this.accountVM.allTokens.length;
    token.id = this.tokenAddress;
    token.show = true;
    token.amount = Number.parseFloat(this.balance);

    this.accountVM.allTokens.push(token);
    this.accountVM.save();
  }
}
