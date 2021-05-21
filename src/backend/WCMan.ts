import { WalletConnect } from './WalletConnect';

class WCMan {
  private cache = new Set<string>();

  async connectAndWaitSession(uri: string, modal = false) {
    if (this.cache.has(uri)) return;

    const wc = new WalletConnect(uri, modal);
    this.cache.add(uri);

    return await new Promise<WalletConnect>((resolve) => {
      const timer = setTimeout(() => rejectPromise(), 7000);

      const rejectPromise = () => {
        clearTimeout(timer);
        resolve(undefined);
        wc.dispose(); // uri is expired
      };

      wc.once('error', rejectPromise);
      wc.once('disconnect', rejectPromise);

      wc.once('sessionRequest', () => {
        clearTimeout(timer);
        wc.removeAllListeners('error');
        wc.removeAllListeners('disconnect');
        resolve(wc);
      });
    });
  }
}

export default new WCMan();
