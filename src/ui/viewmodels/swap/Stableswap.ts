import { BigNumber, BigNumberish, Contract } from 'ethers';
import { DAI, IToken, USDC, USDT, sUSD } from '../../../misc/Tokens';
import { MATIC_DAI, MATIC_USDC, MATIC_USDT } from '../../../misc/Tokens';

import StableswapABI from '../../../abis/Stableswap.json';
import { getProviderByChainId } from '../../../common/Provider';

const TriPool = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
const sUSDPool = '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD';

const Polygon_Aave_Pool = '0x445FE580eF8d70FF569aB36e80c647af338db351';

const Tokens: { [chain: number]: { tokens: IToken[]; targets: string[]; contract: string; underlying?: boolean } } = {
  1: { tokens: [DAI, USDC, USDT, sUSD], targets: [TriPool, TriPool, TriPool, sUSDPool], contract: '' },

  137: {
    tokens: [MATIC_DAI, MATIC_USDC, MATIC_USDT],
    targets: [Polygon_Aave_Pool, Polygon_Aave_Pool, Polygon_Aave_Pool],
    contract: '0x3D5f301C93476C0Ae7d2Eab2a369DE4cbb0700aB',
    underlying: true,
  },

  1337: {
    tokens: [DAI, USDC, USDT, sUSD],
    targets: [TriPool, TriPool, TriPool, sUSDPool],
    contract: '0xF16cC3B1B3c3072Ba1110e336212EF72C2Fa59cD',
  },
};

export class Stableswap {
  _fromTokens = Tokens;
  _forTokens = Tokens;

  getContractAddress(chainId: number) {
    return Tokens[chainId].contract;
  }

  fromTokens(chainId: number): IToken[] {
    return this._fromTokens[chainId]?.tokens ?? [];
  }

  forTokens(chainId: number): IToken[] {
    return this._forTokens[chainId]?.tokens ?? [];
  }

  async getAmountOut(chainId: number, from: IToken, to: IToken, amountIn: BigNumber): Promise<BigNumber> {
    const { tokens, targets, contract, underlying } = Tokens[chainId] ?? {};
    if (!tokens || !targets) return;

    const i = tokens.findIndex((t) => t.address === from.address);
    const j = tokens.findIndex((t) => t.address === to.address);
    const target = targets[i];

    const swap = new Contract(contract, StableswapABI, getProviderByChainId(chainId));
    return await swap.get_dy(target, i, j, amountIn, underlying ?? false);
  }

  encodeSwapData(chainId: number, from: IToken, to: IToken, amountIn: BigNumberish, minAmountOut: BigNumberish) {
    const { tokens, targets, contract, underlying } = Tokens[chainId] ?? {};
    if (!tokens) return;

    const i = tokens.findIndex((t) => t.address === from.address);
    const j = tokens.findIndex((t) => t.address === to.address);
    const target = targets[i];

    const swap = new Contract(contract, StableswapABI, getProviderByChainId(chainId));
    return swap.interface.encodeFunctionData('exchange', [
      target,
      i,
      from.address,
      j,
      to.address,
      amountIn,
      minAmountOut,
      underlying ?? false,
    ]);
  }
}

export default new Stableswap();
