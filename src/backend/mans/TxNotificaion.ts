import { ERC20Token } from '../../common/ERC20Token';
import { getProviderByChainId } from '../../common/Provider';
import { hexZeroPad } from 'ethers/lib/utils';
import { utils } from 'ethers';

class TxNotification {
  private tokens = new Map<string, ERC20Token>();

  watch(erc20s: string[], addrs: string[], chainId: number) {
    const provider = getProviderByChainId(chainId);
    const tokens = erc20s.map((addr) => new ERC20Token(addr, provider));

    for (let token of tokens) {
      if (this.tokens.has(token.address)) continue;

      this.tokens.set(token.address, token);

      provider.on(
        {
          address: token.address,
          topics: [utils.id('Transfer(address,address,uint256)'), null, addrs.map((addr) => hexZeroPad(addr, 32))],
        },
        (log, event) => {
          console.log(log);
        }
      );
    }
  }
}

export default new TxNotification();
