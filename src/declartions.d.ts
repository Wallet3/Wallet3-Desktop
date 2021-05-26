declare module '*.svg' {
  const content: any;
  export default content;
}

interface WCInternalEvent {
  event: string;
  params: any[];
}

interface WCClientMeta {
  description: string;
  url: string;
  icons: string[];
  name: string;
}

interface WCSessionRequestRequest {
  id: number;
  jsonrpc: '2.0';
  method: 'wc_sessionRequest';
  params: [
    {
      peerId: string;
      peerMeta: WCClientMeta;
      chainId?: number | null;
    }
  ];
}

interface WCCallRequest_eth_sendTransaction {
  from: string;
  to: string;
  gasPrice: string;
  gas: string;
  value: string;
  nonce: string;
  data: string;
}

interface WCCallRequestRequest {
  id: number;
  jsonrpc: '2.0';
  method: 'eth_sendTransaction' | 'eth_signTransaction' | 'eth_sign' | 'personal_sign' | 'eth_signTypedData';
  params: any;
}

interface WCSessionRequestResponse {
  id: number;
  jsonrpc: '2.0';
  result: {
    peerId: string;
    peerMeta: ClientMeta;
    approved: boolean;
    chainId: number;
    accounts: string[];
  };
}

interface WCSessionUpdateRequest {
  id: number;
  jsonrpc: '2.0';
  method: 'wc_sessionUpdate';
  params: [
    {
      approved: boolean;
      chainId: number;
      accounts: string[];
    }
  ];
}

interface WCEncryptionPayload {
  data: string;
  hmac: string;
  iv: string;
}

interface IWcSession {
  connected: boolean;
  accounts: string[];
  chainId: number;
  bridge: string;
  key: string;
  clientId: string;
  clientMeta: WCClientMeta | null;
  peerId: string;
  peerMeta: WCClientMeta | null;
  handshakeId: number;
  handshakeTopic: string;
}

////////////////////////ethers///////////////////////

interface TypedDataDomain {
  name?: string;
  version?: string;
  chainId?: BigNumberish;
  verifyingContract?: string;
  salt?: BytesLike;
}

interface TypedDataField {
  name: string;
  type: string;
}
