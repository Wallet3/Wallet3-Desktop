import { BigNumber, utils } from 'ethers';

import { ERC20Token } from '../../common/ERC20Token';
import { IToken } from '../../misc/Tokens';
import { getProviderByChainId } from '../../common/Provider';

class TxNotification {
  private tokens = new Map<string, ERC20Token>();

  async watch(erc20s: IToken[], addrs: string[], chainId: number) {
    if (addrs.length === 0) return;

    const provider = getProviderByChainId(chainId);
    const tokens = erc20s.map((t) => new ERC20Token(t.address, provider));
    console.log(await provider.ready);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (this.tokens.has(token.address)) continue;

      this.tokens.set(token.address, token);
      console.log(`watch ${erc20s[i].symbol}`, addrs[0]);

      const filter = token.filters.Transfer(null, addrs[0]);
      //   token.on(filter, (from: string, to: string, value: BigNumber) => {
      //     console.log(erc20s[i].symbol, from, to, value);
      //   });
      token.on('Transfer', (a, b, c, e) => {
        console.log(a, b, c, e);
      });
    }
  }
}

export default new TxNotification();
