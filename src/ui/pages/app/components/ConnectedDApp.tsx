import './ConnectedDApp.css';

import Image from '../../../components/Image';
import NetworkLabel from './NetworkLabel';
import React from 'react';

export default (props: IWcSession) => {
  return (
    <div className="connectedapp">
      <Image src={props.peerMeta.icons[0] || ''} />
      <div className="info">
        <span className="name">{props.peerMeta.name}</span>
        <div className="extra">
          <span>Last Used: {new Date(props.lastUsedTimestamp).toLocaleDateString()}</span>
          <NetworkLabel chainId={props.chainId} />
        </div>
      </div>
    </div>
  );
};
