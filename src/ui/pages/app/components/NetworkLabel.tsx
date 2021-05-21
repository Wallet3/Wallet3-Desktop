import './NetworkLabel.css';

import { CryptoIcons } from '../../../misc/Icons';
import React from 'react';
import { observer } from 'mobx-react-lite';

const SVGs = new Map([
  [1, [CryptoIcons('eth'), 'Ethereum']],
  [3, [CryptoIcons('eth'), 'Ropsten']],
  [4, [CryptoIcons('eth'), 'Rinkeby']],
  [5, [CryptoIcons('eth'), 'Goerli']],
  [42, [CryptoIcons('eth'), 'Kovan']],

  [137, [CryptoIcons('polygon'), 'Polygon']],
  [100, [CryptoIcons('xdai'), 'xDAI']],
  [250, [CryptoIcons('ftm'), 'Fantom']],
  [56, [CryptoIcons('bsc'), 'BSC']],
]);

interface INetworkLabel {
  chainId: number;
  expand?: boolean;
}

export default observer((props: INetworkLabel) => {
  const [svg, label] = SVGs.get(props.chainId);

  return (
    <div className={`network-label ${props.expand ? 'expand' : ''}`}>
      <img src={svg} alt={label} /> <span>{label}</span>
    </div>
  );
});
