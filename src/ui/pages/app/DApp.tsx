import './DApp.css';

import { Application } from '../../viewmodels/Application';
import { NavBar } from '../../components';
import { Networks } from '../../viewmodels/NetworksVM';
import React from 'react';
import { WalletVM } from '../../viewmodels/WalletVM';
import { useTranslation } from 'react-i18next';

export default ({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const { t } = useTranslation();
  const { dAppVM } = walletVM;

  return (
    <div className="page dapp">
      <NavBar title={t('DApp')} onBackClick={() => app.history.goBack()} />

      <div></div>

      <button
        onClick={(_) => {
          dAppVM.disconnect();
          app.history.goBack();
        }}
      >
        Disconnect
      </button>
    </div>
  );
};
