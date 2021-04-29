export default {
  exchangeDHKey: 'msg-exchange-dh-key',
  getInitStatus: 'msg-get-init-status',
  genMnemonic: 'msg-gen-mnemonic',
  saveTmpMnemonic: 'msg-save-tmp-mnemonic',
  setupMnemonic: 'msg-setup-mnemonic',
  verifyPassword: 'msg-verify-password',
  resetSystem: 'msg-reset-system',
};

export interface InitStatus {
  hasMnemonic: boolean;
  touchIDSupported: boolean;
}

export interface GenMnemonic {
  mnemonic: string;
  address: string;
}
