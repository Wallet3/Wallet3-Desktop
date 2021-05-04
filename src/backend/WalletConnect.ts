import App from './App';
import EventEmitter from 'events';
import WalletConnector from '@walletconnect/client';

export class WalletConnect extends EventEmitter {
  connector: WalletConnector;
  peerId: string;
  chainId: number;
  peerMeta: WCClientMeta;

  constructor(uri: string) {
    super();

    this.connector = new WalletConnector({
      uri,
      clientMeta: {
        name: 'Wallet 3',
        description: 'A secure desktop wallet for Bankless Era',
        icons: [],
        url: 'https://wallet3.io',
      },
    });

    this.connector.on('session_request', this.handleSessionRequest);
  }

  handleSessionRequest = (error: Error, payload: WCSessionRequestRequest) => {
    if (error) {
      this.emit('error', error);
      return;
    }

    const [{ peerMeta, chainId, peerId }] = payload.params;
    this.peerId = peerId;
    this.chainId = chainId;
    this.peerMeta = peerMeta;

    this.emit('sessionRequest', payload);

    App.createPopupWindow('connectDapp', payload.params);
  };

  dispose() {
    this.connector.killSession();
    this.removeAllListeners();
  }
}

export async function connectAndWaitSession(uri: string) {
  const wc = new WalletConnect(uri);

  try {
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => reject(), 3000);
      wc.once('sessionRequest', () => resolve());
      wc.once('error', (error) => {
        console.log('error', error);
        reject();
      });
    });

    console.log('session requested');
    return wc;
  } catch (error) {
    wc.dispose(); // uri is expired
    console.log('session expired');
    return undefined;
  }
}
