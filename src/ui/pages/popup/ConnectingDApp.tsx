import './ConnectingDApp.css';

import Feather from 'feather-icons-react';
import React from 'react';
import wc from '../../../assets/icons/app/walletconnect-logo.svg';

const appicon = require('../../../assets/icons/app/AppIcon.png').default;

export default () => {
  return (
    <div className="page dapp-connecting">
      <div className="content">
        <img src={appicon} />
        <div className="connecting">
          <Feather icon="link-2" size={24} color="#6186ff" />
        </div>
        <img src={wc} alt="" />
      </div>
    </div>
  );
};
