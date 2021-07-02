import './PopupTitle.css';

import Feather from 'feather-icons-react';
import Logo from './Logo';
import { NetworkIcons } from '../misc/Icons';
import { Networks } from '../../misc/Networks';
import React from 'react';

export default ({ title, icon, chainId }: { title?: string; icon?: string; chainId?: number }) => {
  const network = Networks.find((n) => n?.chainId === chainId);

  return (
    <div className="pop-title">
      <div className="title">
        {icon ? <Feather icon={icon} size={15} /> : undefined}
        <span>{title}</span>
      </div>

      {chainId ? (
        <div className="network" title={network.network}>
          <img src={NetworkIcons(network.network)} alt="" />
          <span>{network.network}</span>
        </div>
      ) : (
        <Logo width={72} fill="#00000020" />
      )}
    </div>
  );
};
