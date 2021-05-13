import './NetworkLabel.css';

import Icons from '../../../misc/Icons';
import React from 'react';
import { observer } from 'mobx-react-lite';

const SVGs = new Map([
  [1, [Icons('eth'), 'Ethereum']],
  [3, [Icons('eth'), 'Ropsten']],
  [4, [Icons('eth'), 'Rinkeby']],
  [5, [Icons('eth'), 'Goerli']],
  [42, [Icons('eth'), 'Kovan']],

  [137, [Icons('polygon'), 'Polygon']],
  [100, [Icons('xdai'), 'xDAI']],
  [250, [Icons('ftm'), 'Fantom']],
  [56, [Icons('bsc'), 'BSC']],
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
