import { BigNumber, ethers } from 'ethers';

import POAPAbi from '../abis/POAP.json';
import axios from 'axios';
import { getProviderByChainId } from '../common/Provider';

class POAP {
  readonly contract = new ethers.Contract('0x22C1f6050E56d2876009903609a2cC3fEf83B415', POAPAbi, getProviderByChainId(1));

  async balanceOf(address: string) {
    const amount: BigNumber = await this.contract.balanceOf(address);
    return amount.toNumber();
  }

  async getTokenDetails(address: string, count: number) {
    const details = await Promise.all(
      new Array(count).fill(0).map(async (_, index) => {
        return (await this.contract.tokenDetailsOfOwnerByIndex(address, index)) as {
          tokenId: BigNumber;
          eventId: BigNumber;
        };
      })
    );

    return details.map(async (basic) => {
      const tokenURI = await this.contract.tokenURI(basic.tokenId);
      const metadata = (await axios.get(tokenURI)).data as {
        description: string;
        external_url: string;
        home_url: string;
        image_url: string;
        name: string;
        year: number;
        tags: string[];
      };
      return { ...basic, tokenURI, metadata };
    });
  }
}

export default new POAP();
