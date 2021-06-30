import { BigNumber, ethers } from 'ethers';

import ERC20ABI from '../abis/ERC20.json';

export class ERC20Token {
  address: string;
  erc20: ethers.Contract;

  constructor(address: string, provider: ethers.providers.BaseProvider) {
    this.address = address;
    this.erc20 = new ethers.Contract(address, ERC20ABI, provider);
  }

  balanceOf(guy: string): Promise<BigNumber> {
    return this.erc20.balanceOf(guy);
  }

  name(): Promise<string> {
    return this.erc20.name();
  }

  async decimals(): Promise<number> {
    return (await this.erc20.decimals()).toNubmer();
  }

  symbol(): Promise<string> {
    return this.erc20.symbol();
  }
}
