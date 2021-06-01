import axios from 'axios';

class Rarible {
  async getItemsByOwner(owner: string) {
    try {
      const { total, items } = (
        await axios.get(`https://api.rarible.com/protocol/v0.1/ethereum/nft/items/byOwner?owner=${owner}`)
      ).data as RaribleRoot;

      if (total === 0) return [];

      return await Promise.all(
        items.map(async (i) => {
          const item = (await axios.get(`https://api.rarible.com/protocol/v0.1/ethereum/nft/items/${i.id}/meta`))
            .data as RaribleNFTMeta;
          return { ...i, ...item };
        })
      );
    } catch (error) {
      return [];
    }
  }
}

export default new Rarible();

export interface RaribleCreator {
  account: string;
  value: number;
}

export interface RaribleRoyalty {
  account: string;
  value: number;
}

interface RaribleItem {
  id: string;
  contract: string;
  tokenId: string;
  creators: RaribleCreator[];
  supply: string;
  lazySupply: string;
  owners: string[];
  royalties: RaribleRoyalty[];
}

interface RaribleRoot {
  total: number;
  continuation: string;
  items: RaribleItem[];
}

interface Attribute {
  key: string;
  value: string;
}

interface Url {
  ORIGINAL: string;
  BIG: string;
  PREVIEW: string;
}

interface ORIGINAL {
  type: string;
  width: number;
  height: number;
}

interface Image {
  url: Url;
  meta: { ORIGINAL: ORIGINAL };
}

interface RaribleNFTMeta {
  name: string;
  description: string;
  attributes: Attribute[];
  image: Image;
}
