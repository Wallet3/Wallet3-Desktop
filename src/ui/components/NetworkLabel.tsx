import './NetworkLabel.css';

import { AppsIcon, NetworkIcons } from '../misc/Icons';

import React from 'react';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

const SVGs = new Map([
  [0, [AppsIcon, i18n.t('Auto Switch')]],
  [1, [NetworkIcons('Ethereum'), 'Ethereum']],
  [3, [NetworkIcons('Ropsten'), 'Ropsten']],
  [4, [NetworkIcons('Rinkeby'), 'Rinkeby']],
  [5, [NetworkIcons('Goerli'), 'Goerli']],
  [42, [NetworkIcons('Kovan'), 'Kovan']],

  [137, [NetworkIcons('Polygon'), 'Polygon']],
  [100, [NetworkIcons('xDAI'), 'xDAI']],
  [250, [NetworkIcons('Fantom'), 'Fantom']],
  [56, [NetworkIcons('bsc'), 'BSC']],
  [128, [NetworkIcons('Heco'), 'Heco']],
  [66, [NetworkIcons('OKEx'), 'OKEx']],

  [80001, [NetworkIcons('Polygon'), 'Mumbai']],
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
