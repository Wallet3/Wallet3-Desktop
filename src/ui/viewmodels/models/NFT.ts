import { BigNumber } from '@ethersproject/bignumber';

export class NFT {
  name: string;
  symbol?: string;
  tokenURI: string;
  tokenId: BigNumber;
  description?: string;
  image_url?: string;

  contract: string;
}
