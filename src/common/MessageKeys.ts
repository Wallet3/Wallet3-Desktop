export default {
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
