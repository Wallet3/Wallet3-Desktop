import './ConnectedDApp.css';

import { NavBar, NetworkMenu } from '../../components';
import { PublicNetworks, Testnets } from '../../../common/Networks';

import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import Image from '../../components/Image';
import React from 'react';
import { observer } from 'mobx-react-lite';
import shell from '../../bridges/Shell';
import { useTranslation } from 'react-i18next';

export default observer(({ app }: { app: Application }) => {
  const { t } = useTranslation();
  const { dAppVM } = app.currentWallet;

  return (
    <div className="page dapp">
      <NavBar title={t('DApp')} onBackClick={() => app.history.goBack()} />

      <div className="form">
        <div>
          <div>
            <Feather icon="compass" size={14} />
            {t('Network')}:
          </div>

          <div>
            <NetworkMenu
              onNetworkSelected={(id) => dAppVM.switchNetwork(id)}
              currentChainId={dAppVM.userChainId}
              showAutoSwitch
              publicNetworks={PublicNetworks}
              testnets={Testnets}
              position="anchor"
            />
          </div>
        </div>

        <h3>{t('App Info')}</h3>

        <div className="app-item">
          <span>DApp:</span>
          <span title={dAppVM.appName}>
            <Image src={dAppVM.appIcon} />
            {dAppVM.appName}
          </span>
        </div>

        <div className="app-item">
          <span>{t('Description')}:</span>
          <span title={dAppVM.appDesc}>{dAppVM.appDesc}</span>
        </div>

        <div className="app-item">
          <span>Url:</span>
          <span className="url" onClick={(_) => shell.open(dAppVM.appUrl)} title={dAppVM.appUrl}>
            {dAppVM.appUrl}
          </span>
        </div>

        <div className="app-item">
          <span>{t('Last used')}:</span>
          <span>{new Date(dAppVM.lastUsedTimestamp).toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={(_) => {
          dAppVM.disconnect();
          app.history.goBack();
        }}
      >
        {t('Disconnect')}
      </button>
    </div>
  );
});
