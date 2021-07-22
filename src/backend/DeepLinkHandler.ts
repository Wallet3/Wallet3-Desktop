import App from './App';
import { KeyMan } from './mans';
import i18n from '../i18n';
import querystring from 'querystring';

export const supportedSchemes = ['ethereum', 'wallet3', 'ledgerlive'];

export async function handleDeepLink(deeplink: string) {
  if (!deeplink) return;

  const query = querystring.decode(deeplink);
  const [protocol] = Object.getOwnPropertyNames(query);
  const uri = query[protocol] as string;

  if (!uri?.startsWith('wc:') || !uri?.includes('bridge=')) return undefined;

  if (!KeyMan.current) return;

  if (!KeyMan.current.authenticated) {
    App.createPopupWindow(
      'msgbox',
      {
        title: i18n.t('Authentication'),
        icon: 'alert-triangle',
        message: i18n.t('Wallet not authorized'),
      },
      { height: 250 }
    );
    return;
  }

  const window = await App.createPopupWindow('dapp-connecting', {}, { height: 103, resizable: false });
  const success = await KeyMan.currentWCMan.connectAndWaitSession(uri);
  if (!success) {
    App.createPopupWindow(
      'msgbox',
      {
        title: 'WalletConnect',
        icon: 'link-2',
        message: i18n.t('WalletConnect uri expired'),
      },
      { height: 250 }
    );
  }

  window.close();
}
