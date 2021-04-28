import * as crypto from 'crypto';
import * as ethers from 'ethers';

class KeyMan {
  tmpMnemonic?: string;

  genMnemonic(length = 12) {
    const entropy = crypto.randomBytes(length === 12 ? 16 : 32);
    this.tmpMnemonic = ethers.utils.entropyToMnemonic(entropy);

    const wallet = ethers.Wallet.fromMnemonic(this.tmpMnemonic);
    return { mnemonic: this.tmpMnemonic, address: wallet.address };
  }
}

export default new KeyMan();
