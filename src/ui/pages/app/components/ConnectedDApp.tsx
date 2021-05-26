import './ConnectedDApp.css';

import { AppsIcon, CryptoIcons } from '../../../misc/Icons';

import Image from '../../../components/Image';
import { Networks } from '../../../viewmodels/NetworksVM';
import React from 'react';

export default (props: IWcSession) => {
  const network = Networks.find((n) => n?.chainId === props.chainId)?.symbol;

  return (
    <div className="connectedapp">
      <div className="dapp-logo">
        <Image className="appicon" src={props.peerMeta.icons[0] || ''} />
        <Image className="network" src={network ? CryptoIcons(network) : AppsIcon} />
      </div>
      <div className="info">
        <div className="basic">
          <span className="name">{props.peerMeta.name}</span>
        </div>
        <div className="extra">
          <span>Last Used: {new Date(props.lastUsedTimestamp).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
