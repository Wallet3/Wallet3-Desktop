import * as crypto from 'crypto';

import { ethers } from 'ethers';

ethers.Wallet.createRandom({});

class KeyMan {
  mnemonic: string;

  genMnemonic(length = 12): string {
    this.mnemonic = ethers.utils.entropyToMnemonic(crypto.randomBytes(length === 12 ? 16 : 32));
    return this.mnemonic;
  }
}

export default new KeyMan();
