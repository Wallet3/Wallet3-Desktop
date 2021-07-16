import { BigNumber, ethers } from 'ethers';

import ERC20ABI from '../abis/ERC20.json';

export class ERC20Token {
  address: string;
  erc20: ethers.Contract;
  balance = BigNumber.from(0);

  constructor(address: string, provider: ethers.providers.BaseProvider) {
    this.address = address;
    this.erc20 = new ethers.Contract(address, ERC20ABI, provider);
  }

  async balanceOf(guy: string): Promise<BigNumber> {
    this.balance = await this.erc20.balanceOf(guy);
    return this.balance;
  }

  name(): Promise<string> {
    return this.erc20.name();
  }

  async decimals(): Promise<number> {
    return (await this.erc20.decimals()).toNumber();
  }

  symbol(): Promise<string> {
    return this.erc20.symbol();
  }

  get filters() {
    return this.erc20.filters;
  }

  on(filter: string | ethers.EventFilter, listener: ethers.providers.Listener) {
    this.erc20.on(filter, listener);
  }
}
