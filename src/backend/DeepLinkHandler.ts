import * as erc681parser from 'eth-url-parser';

import { getProviderByChainId, getTransactionCount } from '../common/Provider';

import App from './App';
import { ConfirmSendTx } from '../common/Messages';
import { ERC20Token } from '../common/ERC20Token';
import GasnowWs from '../gas/Gasnow';
import { KeyMan } from './mans';
import { findTokenByAddress } from '../misc/Tokens';
import i18n from '../i18n';
import querystring from 'querystring';
import { utils } from 'ethers';

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
  let {
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

  if (!KeyMan.current.authenticated) {
    popupNotAuthorized();
    return;
  }
  const chainId = Number.parseInt(cid) || 1;

  const provider = getProviderByChainId(chainId);
  target_address = utils.isAddress(target_address) ? target_address : await provider.lookupAddress(target_address);
  const from = KeyMan.current.currentAddress;
  const gas = Number.parseInt(parameters['gas'] || parameters['gasLimit']);
  const gasPrice = Number.parseInt(parameters['gasPrice']) || GasnowWs.fast;
  const nonce = Number.parseInt(parameters['nonce']) || (await getTransactionCount(chainId, from));

  if (function_name) {
    const token = new ERC20Token(target_address, provider);
    const found = findTokenByAddress(target_address);
    const balance = (await token.balanceOf(from)).toString();
    const to = parameters['address'];
    const amount = parameters['uint256'] || 0;
    const data = token.encodeTransferData(to, amount);

    let transferToken: { decimals: number; symbol: string; balance: string };

    if (found) {
      transferToken = { ...found, balance };
    } else {
      transferToken == { symbol: await token.symbol(), decimals: await token.decimals(), balance };
    }

    App.createPopupWindow('sendTx', {
      chainId,
      from: from,
      to: to,
      data: data,
      gas: gas || (await token.estimateGas(from, to)),
      gasPrice,
      nonce,
      value: '0',

      transferToken,
    } as ConfirmSendTx);
    return;
  }

  const params: ConfirmSendTx = {
    chainId,
    from,
    data: '0x',
    to: target_address,
    gas: gas || 21000,
    gasPrice,
    nonce,
    value: parameters['value'] || '0',
  };

  App.createPopupWindow('sendTx', params);
}
