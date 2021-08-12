import './ConnectedDAppLabel.css';

import { AppsIcon, NetworkIcons } from '../../../misc/Icons';

import Image from '../../../components/Image';
import { Networks } from '../../../../common/Networks';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default (props: IRawWcSession) => {
  const network = Networks.find((n) => n.chainId === props.userChainId);
  const { t } = useTranslation();

  return (
    <div className="connectedapp-label">
      <div className="dapp-logo">
        <Image className="appicon" src={props.peerMeta.icons[0] || ''} />
        {network?.chainId === 1 ? undefined : (
          <Image className="network" src={network ? NetworkIcons(network.network) : AppsIcon} />
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
