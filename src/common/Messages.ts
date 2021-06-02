export default {
  exchangeDHKey: 'msg-exchange-dh-key',
  getInitStatus: 'msg-get-init-status',
  genMnemonic: 'msg-gen-mnemonic',
  saveTmpMnemonic: 'msg-save-tmp-mnemonic',
  setDerivationPath: 'msg-set-derivation-path',
  setupMnemonic: 'msg-setup-mnemonic',
  readMnemonic: 'msg-read-mnemonic',
  verifyPassword: 'msg-verify-password',
  changePassword: 'msg-change-passcode',
  initVerifyPassword: 'msg-init-verify-password',
  promptTouchID: 'msg-prompt-touchid',
  resetSystem: 'msg-reset-system',
  createTransferTx: 'msg-create-transfer-tx',
  releaseWindow: 'msg-release-window',
  clearHistory: 'msg-clear-history',
  changeChainId: 'msg-change-chain-id',
  changeAccountIndex: 'msg-change-account-index',
  popupAuthentication: 'msg-popup-authentication',
  returnAuthenticationResult: (id: string) => `msg-return-authentication-${id}`,
  disconnectDApp: 'msg-disconnect-dapp',
  switchDAppNetwork: 'msg-switch-dapp-network',
  sendLocalNotification: 'msg-send-notification',
  popupMessageBox: 'msg-popup-msgbox',
  returnMsgBoxResult: (id: string) => `msg-return-msgbox-result-${id}`,

  scanQR: 'msg-scan-qr',
  connectWallet: 'msg-connect-wallet',
  initWindowType: 'msg-init-window-type',

  sendTx: 'msg-send-tx',
  signMsg: 'msg-sign-msg',

  pendingTxsChanged: 'msg-pendingtxs-changed',
  wcConnectsChanged: 'msg-wcconnects-changed',
  idleExpired: 'msg-app-idle-expired',
};

export const WcMessages = {
  approveWcSession: (peerId: string) => `wc-approve-session-${peerId}`,
  rejectWcSession: (peerId: string) => `wc-reject-session-${peerId}`,
  approveWcCallRequest: (peerId: string, reqid: number) => `wc-approve-call-${peerId}-${reqid}`,
  rejectWcCallRequest: (peerId: string, reqid: number) => `wc-reject-call-${peerId}-${reqid}`,
};

export interface InitStatus {
  hasSecret: boolean;
  touchIDSupported: boolean;
  appAuthenticated: boolean;
  addresses?: string[];
  pendingTxs: TxParams[];
  connectedDApps: IWcSession[];
  machineId: string;
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

export interface AuthenticationResult {
  success: boolean;
  authKey: string;
}

export interface BooleanResult {
  success: boolean;
}

export interface TxParams {
  chainId: number;
  from: string;
  to: string;
  value: string;
  gas: number;
  gasPrice: number; // wei
  nonce: number;
  data: string;
  hash?: string;
  timestamp?: number;
  accountIndex?: number;
}

export interface AuthParams {
  password?: string;
  viaTouchID: boolean;
}

export interface SendTxParams extends TxParams, AuthParams {}

export interface SignMessage extends AuthParams {
  msg: string;
}

export interface WCParams {
  peerId: string;
  reqid: number;
  app: WCClientMeta;
}

export interface ConfirmSendTx extends TxParams {
  receipient?: {
    address: string;
    name?: string;
  };
  transferToken?: { symbol: string; decimals: number };
  walletConnect?: WCParams;
}

export interface RequestSignMessage {
  raw: string[];
  msg?: string;
  walletConnect: WCParams;
  json?: boolean;
}

export type PopupWindowTypes = 'connectDapp' | 'sign' | 'sendTx' | 'scanQR' | 'auth' | 'msgbox';
