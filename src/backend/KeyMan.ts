import * as crypto from 'crypto';

import { ethers } from 'ethers';

class KeyMan {
  tmpMnemonic?: string;

  genMnemonic(length = 12): string {
    const entropy = crypto.randomBytes(length === 12 ? 16 : 32);
    this.tmpMnemonic = ethers.utils.entropyToMnemonic(entropy);
    return this.tmpMnemonic;
  }
}

export default new KeyMan();
