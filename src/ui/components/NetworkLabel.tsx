import './NetworkLabel.css';

import BSC from '../../assets/icons/crypto/bsc.svg';
import ETH from '../../assets/icons/crypto/eth.svg';
import POLYGON from '../../assets/icons/crypto/polygon.svg';
import React from 'react';

const SVGs = new Map([
  ['ETH', ETH],
  ['BSC', BSC],
  ['POLYGON', POLYGON],
]);

const Labels = new Map([
  ['ETH', 'Ethereum'],
  ['BSC', 'BSC'],
  ['POLYGON', 'POLYGON'],
]);

interface INetworkLabel {
  network: string;
  className?: string;
}

export default (props: INetworkLabel) => {
  return (
    <div className={`network-label ${props.className ?? ''}`}>
      <img src={SVGs.get(props.network)} alt={props.network} /> <span>{Labels.get(props.network)}</span>
    </div>
  );
};
