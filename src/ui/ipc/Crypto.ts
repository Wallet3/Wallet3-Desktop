const KEY = 'wallet3_crypto';

interface CryptoApi {
  sha256(content: string): string;
}

const crypto = window[KEY] as CryptoApi;

export default crypto;
