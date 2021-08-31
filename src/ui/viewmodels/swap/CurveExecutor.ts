import { DAI, IToken, USDC, USDT, sUSD } from '../../../misc/Tokens';

const TriPool = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
const sUSDPool = '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD';

export class CurveExecutor {
  tokenMap: [IToken, { [chainId: number]: string }][] = [
    [DAI, { 1: TriPool }],
    [USDC, { 1: TriPool }],
    [USDT, { 1: TriPool }],
    [sUSD, { 1: sUSDPool }],
  ];

  tokens(chainId: number): IToken[] {
    return this.tokenMap.filter((v) => v[1][chainId] !== undefined).map((v) => v[0]);
  }
}

export default new CurveExecutor();
