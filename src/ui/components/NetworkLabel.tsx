import './NetworkLabel.css';

import BSC from '../../assets/icons/crypto/bsc.svg';
import ETH from '../../assets/icons/crypto/eth.svg';
import FTM from '../../assets/icons/crypto/ftm.svg';
import POLYGON from '../../assets/icons/crypto/polygon.svg';
import React from 'react';
import { observer } from 'mobx-react-lite';
import xDAI from '../../assets/icons/crypto/xdai.svg';

const SVGs = new Map([
  [1, [ETH, 'Ethereum']],
  [137, [POLYGON, 'Polygon']],
  [100, [xDAI, 'xDAI']],
  [250, [FTM, 'Fantom']],
  [56, [BSC, 'BSC']],
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
