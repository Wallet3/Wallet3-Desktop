export default {
  exchangeDHKey: 'msg-exchange-dh-key',
  getInitStatus: 'msg-get-init-status',
  genMnemonic: 'msg-gen-mnemonic',
  saveMnemonic: 'msg-save-mnemonic',
};

export interface InitStatus {
  hasMnemonic: boolean;
  touchIDSupported: boolean;
}

export interface GenMnemonic {
  mnemonic: string;
  address: string;
}
