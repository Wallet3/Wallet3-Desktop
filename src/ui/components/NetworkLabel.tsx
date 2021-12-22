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
  [10, [NetworkIcons('Optimism'), 'Optimism']],
  [42161, [NetworkIcons('Arbitrum'), 'Arbitrum']],
  [69, [NetworkIcons('Optimism'), 'Op Kovan']],
  [420, [NetworkIcons('Optimism'), 'Op Goerli']],
  [272, [NetworkIcons('zkSync'), 'zkSync 2.0']],

  [43114, [NetworkIcons('Avalanche'), 'Avalanche']],
  [137, [NetworkIcons('Polygon'), 'Polygon']],
  [80001, [NetworkIcons('Polygon'), 'Mumbai']],
  [100, [NetworkIcons('xDAI'), 'xDAI']],
  [250, [NetworkIcons('Fantom'), 'Fantom']],
  [42220, [NetworkIcons('Celo'), 'Celo']],

  [128, [NetworkIcons('Heco'), 'Heco']],
  [56, [NetworkIcons('bsc'), 'BSC']],
  [66, [NetworkIcons('OKEx'), 'OKEx']],
  [10000, [NetworkIcons('SmartBCH'), 'SmartBCH']],
  [288, [NetworkIcons('Boba'), 'Boba']],

  [1337, [NetworkIcons('Ganache'), 'Ganache']],
]);

interface INetworkLabel {
  chainId: number;
  expand?: boolean;
  noLabel?: boolean;
  active?: boolean;
  color?: string;
}

export default observer((props: INetworkLabel) => {
  const [svg, label] = SVGs.get(props.chainId);

  return (
    <div className={`network-label ${props.expand ? 'expand' : ''}`}>
      <img src={svg} alt={label} />{' '}
      {props.noLabel ? undefined : <span style={{ color: props.active ? props.color : undefined }}>{label}</span>}
    </div>
  );
});
