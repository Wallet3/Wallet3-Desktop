import { DAI, IToken, USDC, USDT, sUSD } from '../../../misc/Tokens';

const TriPool = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
const sUSDPool = '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD';

const Tokens: { [chain: number]: { tokens: IToken[]; targets: string[] } } = {
  1: { tokens: [DAI, USDC, USDT, sUSD], targets: [TriPool, TriPool, TriPool, sUSDPool] },
};

export class CurveExecutor {
  _fromTokens = Tokens;
  _forTokens = Tokens;

  fromTokens(chainId: number): IToken[] {
    return this._fromTokens[chainId]?.tokens ?? [];
  }

  forTokens(chainId: number): IToken[] {
    return this._forTokens[chainId]?.tokens ?? [];
  }
}

export default new CurveExecutor();
