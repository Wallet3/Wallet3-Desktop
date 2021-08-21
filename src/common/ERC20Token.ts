import { BigNumber, BigNumberish, ethers } from 'ethers';

import ERC20ABI from '../abis/ERC20.json';

export class ERC20Token {
  address: string;
  erc20: ethers.Contract;
  balance = BigNumber.from(0);

  get interface() {
    return this.erc20.interface;
  }

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
    return await this.erc20.decimals();
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

  async estimateGas(from: string, to: string, amt: BigNumberish = BigNumber.from(1)) {
    try {
      return Number.parseInt(((await this.erc20.estimateGas.transfer(to, amt)).toNumber() * 2) as any);
    } catch (error) {}

    try {
      return Number.parseInt(((await this.erc20.estimateGas.transferFrom(from, to, amt)).toNumber() * 3) as any);
    } catch (error) {}

    return 150_000;
  }

  encodeTransferData(to: string, amount: BigNumberish) {
    return this.interface.encodeFunctionData('transfer', [to, amount]);
  }
}
