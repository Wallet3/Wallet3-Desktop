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

  fetchAddresses: 'msg-fetch-addresses',
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
