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

export const WcMessages = {
  approveWcSession: (peerId: string) => `wc-approve-session-${peerId}`,
  rejectWcSession: (peerId: string) => `wc-reject-session-${peerId}`,
  approveWcCallRequest: (peerId: string, reqid: number) => `wc-approve-call-${reqid}-${peerId}`,
  rejectWcCallRequest: (peerId: string, reqid: number) => `wc-reject-call-${reqid}-${peerId}`,
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

export interface ConfirmSendTx {
  chainId: number;
  from: string;
  to: string;
  value: string;
  gas: number;
  gasPrice: number; // wei
  nonce: number;
  data: string;
  receipient?: {
    address: string;
    name?: string;
  };
  transferToken?: { symbol: string; decimals: number };
  walletConnect?: { peerId: string; reqid: number };
}

export type PopupWindowTypes = 'connectDapp' | 'signature' | 'sendTx' | 'scanQR';
