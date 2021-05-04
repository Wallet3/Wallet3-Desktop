export default {
  exchangeDHKey: 'msg-exchange-dh-key',
  getInitStatus: 'msg-get-init-status',
  genMnemonic: 'msg-gen-mnemonic',
  saveTmpMnemonic: 'msg-save-tmp-mnemonic',
  setupMnemonic: 'msg-setup-mnemonic',
  verifyPassword: 'msg-verify-password',
  initVerifyPassword: 'msg-init-verify-password',
  promptTouchID: 'msg-prompt-touchid',
  resetSystem: 'msg-reset-system',
  createTransferTx: 'msg-create-transfer-tx',
  fetchAddresses: 'msg-fetch-addresses',
  releaseWindow: 'msg-release-window',

  connectWallet: 'msg-connect-wallet',
  initWindowType: 'msg-init-window-type',
};

export interface InitStatus {
  hasMnemonic: boolean;
  touchIDSupported: boolean;
}

export interface InitVerifyPassword {
  verified: boolean;
  addresses: string[];
}

export interface GenMnemonic {
  mnemonic: string;
  address: string;
}

export interface SetupMnemonic {
  success: boolean;
  addresses: string[];
}

export interface CreateTransferTx {
  to: string;
  value: string;
  gas: number;
  gasPrice: number;
  nonce: number;
  data: string;
  receipt?: {
    address: string;
    name?: string;
  };
  token: { symbol: string; decimals: number; amount: string };
  nativeToken?: { amount: number; decimals: number };
}

export type PopupWindowTypes = 'connectDapp' | 'signature' | 'sendTx' | 'scanQR';
