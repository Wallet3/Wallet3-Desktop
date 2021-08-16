import './ConnectingDApp.css';

import Feather from 'feather-icons-react';
import React from 'react';
import appicon from '../../../assets/icons/app/AppIcon.svg';
import wc from '../../../assets/icons/app/walletconnect-logo.svg';

export default () => {
  return (
    <div className="page dapp-connecting">
      <div className="content">
        <img src={appicon} style={{ width: 67, height: 67 }} />
        <div className="connecting">
          <Feather icon="link-2" size={24} color="#6186ff" />
        </div>
        <img src={wc} alt="" />
      </div>
    </div>
  );
};
