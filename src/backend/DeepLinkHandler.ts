import * as erc681parser from 'eth-url-parser';

import App from './App';
import { ConfirmSendTx } from '../common/Messages';
import GasnowWs from '../gas/Gasnow';
import { KeyMan } from './mans';
import { getTransactionCount } from '../common/Provider';
import i18n from '../i18n';
import querystring from 'querystring';

export const supportedSchemes = ['ethereum', 'wallet3', 'ledgerlive'];

const popupNotAuthorized = () =>
  App.createPopupWindow(
    'msgbox',
    {
      title: i18n.t('Authentication'),
      icon: 'alert-triangle',
      message: i18n.t('Wallet not authorized'),
    },
    { height: 250 }
  );

export async function handleDeepLink(deeplink: string) {
  if (!deeplink) return;

  const query = querystring.decode(deeplink);
  const [protocol] = Object.getOwnPropertyNames(query);
  const uri = query[protocol] as string;

  if (uri?.startsWith('ethereum')) {
    handleERC681(uri);
    return;
  }

  if (!uri?.startsWith('wc:') || !uri?.includes('bridge=')) return undefined;

  if (!KeyMan.current) return;

  if (!KeyMan.current.authenticated) {
    popupNotAuthorized();
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

async function handleERC681(uri: string) {
  const {
    target_address,
    chainId: cid,
    parameters,
    function_name,
  } = erc681parser.parse(uri) as {
    scheme: string;
    target_address: string;
    function_name?: string;
    chainId?: string;
    parameters: { [index: string]: string };
  };

  if (!App.ready) {
    popupNotAuthorized();
    return;
  }

  const from = KeyMan.current.currentAddress;
  const chainId = Number.parseInt(cid) || 1;

  if (function_name) {
    return;
  }

  const params: ConfirmSendTx = {
    chainId,
    from,
    data: '0x',
    to: target_address,
    gas: Number.parseInt(parameters['gas'] || parameters['gasLimit']) || 21000,
    gasPrice: Number.parseInt(parameters['gasPrice']) || GasnowWs.fast,
    nonce: Number.parseInt(parameters['nonce']) || (await getTransactionCount(chainId, from)),
    value: parameters['value'] || '0',
  };

  App.createPopupWindow('sendTx', params);
}
