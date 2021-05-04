declare module '*.svg' {
  const content: any;
  export default content;
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
