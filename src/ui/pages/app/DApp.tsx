import './DApp.css';

import { Application } from '../../viewmodels/Application';
import Image from '../../components/Image';
import { NavBar } from '../../components';
import NetworkLabel from './components/NetworkLabel';
import { Networks } from '../../viewmodels/NetworksVM';
import React from 'react';
import { WalletVM } from '../../viewmodels/WalletVM';
import shell from '../../bridges/Shell';
import { useTranslation } from 'react-i18next';

export default ({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const { t } = useTranslation();
  const { dAppVM } = walletVM;

  return (
    <div className="page dapp">
      <NavBar title={t('DApp')} onBackClick={() => app.history.goBack()} />

      <div className="form">
        <div>
          <span>Chain:</span>
          <NetworkLabel chainId={dAppVM.chainId} />
        </div>

        <div>
          <span>dApp:</span>
          <span>
            <Image src={dAppVM.appIcon} />
            {dAppVM.appName}
          </span>
        </div>

        <div>
          <span>Desc:</span>
          <span>{dAppVM.appDesc}</span>
        </div>

        <div>
          <span>Url:</span>
          <span className="url" onClick={(_) => shell.open(dAppVM.appUrl)}>
            {dAppVM.appUrl}
          </span>
        </div>

        <div>
          <span>Last used:</span>
          <span>{new Date(dAppVM.lastUsedTimestamp).toLocaleString()}</span>
        </div>
      </div>

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
