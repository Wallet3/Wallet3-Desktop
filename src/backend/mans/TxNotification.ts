import { BigNumber, utils } from 'ethers';
import { Notification, app, shell } from 'electron';

import { ERC20Token } from '../../common/ERC20Token';
import { IToken } from '../../misc/Tokens';
import { getProviderByChainId } from '../../common/Provider';

class TxNotification {
  private tokens = new Map<string, ERC20Token>();

  async watch(erc20s: IToken[], addrs: string[], chainId: number) {
    if (addrs.length === 0) return;

    const provider = getProviderByChainId(chainId);
    const tokens = erc20s.map((t) => new ERC20Token(t.address, provider, chainId));
    console.log(await provider.ready);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (this.tokens.has(token.address)) continue;

      this.tokens.set(token.address, token);
      console.log(`watch ${erc20s[i].symbol}`, addrs[0]);

      const filterTo = token.filters.Transfer(null, addrs[0]);
      token.on(filterTo, (from: string, to: string, value: BigNumber) => {
        console.log(erc20s[i].symbol, from, to, value);

        new Notification({ title: erc20s[i].symbol, body: `${from} ${to}` }).show();
      });

      const filterFrom = token.filters.Transfer(addrs[0], null);
      token.on(filterFrom, (from: string, to: string, value: BigNumber) => {
        new Notification({ title: erc20s[i].symbol, body: `${from} ${to}` }).show();
      });
    }
  }
}

export default new TxNotification();
