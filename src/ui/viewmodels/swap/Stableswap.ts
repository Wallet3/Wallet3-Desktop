import { BigNumber, Contract } from 'ethers';
import { DAI, IToken, USDC, USDT, sUSD } from '../../../misc/Tokens';

import StableswapABI from '../../../abis/Stableswap.json';
import { getProviderByChainId } from '../../../common/Provider';

const TriPool = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
const sUSDPool = '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD';
const StableswapAddr = '0xF16cC3B1B3c3072Ba1110e336212EF72C2Fa59cD';

const Tokens: { [chain: number]: { tokens: IToken[]; targets: string[] } } = {
  1: { tokens: [DAI, USDC, USDT, sUSD], targets: [TriPool, TriPool, TriPool, sUSDPool] },
};

export class Stableswap {
  _fromTokens = Tokens;
  _forTokens = Tokens;

  fromTokens(chainId: number): IToken[] {
    return this._fromTokens[chainId]?.tokens ?? [];
  }

  forTokens(chainId: number): IToken[] {
    return this._forTokens[chainId]?.tokens ?? [];
  }

  async getForAmount(chainId: number, from: IToken, to: IToken, amount: BigNumber): Promise<BigNumber> {
    const swap = new Contract(StableswapAddr, StableswapABI, getProviderByChainId(chainId));
    const { tokens, targets } = Tokens[chainId] ?? {};
    if (!tokens || !targets) return;

    const i = tokens.findIndex((t) => t.address === from.address);
    const j = tokens.findIndex((t) => t.address === to.address);
    const target = targets[i];

    return await swap.get_dy(target, i, j, amount, false);
  }
}

export default new Stableswap();
