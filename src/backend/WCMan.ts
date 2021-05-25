import { IWcSession, WalletConnect } from './WalletConnect';

class WCMan {
  private cache = new Set<string>();

  async connectAndWaitSession(uri: string, modal = false) {
    if (this.cache.has(uri)) return;

    const wc = new WalletConnect(modal);
    wc.connect(uri);
    this.cache.add(uri);

    return await new Promise<WalletConnect>((resolve) => {
      const timer = setTimeout(() => rejectPromise(), 15000); // waiting for 15 seconds

      const rejectPromise = () => {
        clearTimeout(timer);
        resolve(undefined);
        wc.dispose(); // uri is expired
      };

      wc.once('error', rejectPromise);
      wc.once('disconnect', rejectPromise);
      wc.once('sessionRequest', () => {
        clearTimeout(timer);
        resolve(wc);
      });
    });
  }

  connectViaSession(session: IWcSession) {
    if (this.cache.has(session.handshakeTopic)) return;
    this.cache.add(session.handshakeTopic);

    const wc = new WalletConnect();
    wc.connectViaSession(session);
  }

  clean() {}
}

export default new WCMan();
