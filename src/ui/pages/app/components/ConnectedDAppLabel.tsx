import './ConnectedDAppLabel.css';

import { AppsIcon, CryptoIcons } from '../../../misc/Icons';

import Image from '../../../components/Image';
import { Networks } from '../../../viewmodels/NetworksVM';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default (props: IWcSession) => {
  const network = Networks.find((n) => n.chainId === props.userChainId);
  const { t } = useTranslation();
  
  return (
    <div className="connectedapp">
      <div className="dapp-logo">
        <Image className="appicon" src={props.peerMeta.icons[0] || ''} />
        {network?.chainId === 1 ? undefined : (
          <Image className="network" src={network ? CryptoIcons(network.symbol) : AppsIcon} />
        )}
      </div>
      <div className="info">
        <div className="basic">
          <span className="name">{props.peerMeta.name}</span>
        </div>
        <div className="extra">
          <span>
            {t('Last used')}: {new Date(props.lastUsedTimestamp).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
