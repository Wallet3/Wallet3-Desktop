import './NetworkLabel.css';

import { AppsIcon, CryptoIcons } from '../../../misc/Icons';

import React from 'react';
import i18n from '../../../../i18n';
import { observer } from 'mobx-react-lite';

const SVGs = new Map([
  [0, [AppsIcon, i18n.t('Auto Switch')]],
  [1, [CryptoIcons('eth'), 'Ethereum']],
  [3, [CryptoIcons('eth'), 'Ropsten']],
  [4, [CryptoIcons('eth'), 'Rinkeby']],
  [5, [CryptoIcons('eth'), 'Goerli']],
  [42, [CryptoIcons('eth'), 'Kovan']],

  [137, [CryptoIcons('polygon'), 'Polygon']],
  [100, [CryptoIcons('xdai'), 'xDAI']],
  [250, [CryptoIcons('ftm'), 'Fantom']],
  [56, [CryptoIcons('bsc'), 'BSC']],

  [80001, [CryptoIcons('polygon'), 'Mumbai']],
]);

interface INetworkLabel {
  chainId: number;
  expand?: boolean;
  noLabel?: boolean;
}

export default observer((props: INetworkLabel) => {
  const [svg, label] = SVGs.get(props.chainId);

  return (
    <div className={`network-label ${props.expand ? 'expand' : ''}`}>
      <img src={svg} alt={label} /> {props.noLabel ? undefined : <span>{label}</span>}
    </div>
  );
});
