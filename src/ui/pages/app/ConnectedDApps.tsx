import './ConnectedDApps.css';

import { Image, NavBar } from '../../components';

import { Application } from '../../viewmodels/Application';
import { DAppVM } from '../../viewmodels/wallet/DAppVM';
import Feather from 'feather-icons-react';
import React from 'react';
import { WalletVM } from '../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

export default observer(({ app }: { app: Application }) => {
  const { t } = useTranslation();
  const { currentWallet } = app;
  const { connectedDApps } = currentWallet;

  return (
    <div className="page dapps">
      <NavBar title={t('Connected DApps')} onBackClick={() => app.history.goBack()} />

      <div className="content">
        {connectedDApps.map((item) => {
          return (
            <div
              className="dapp"
              key={item.key}
              onClick={(_) => {
                currentWallet.selectDAppSession(item);
                app.history.push('/connectedapp');
              }}
            >
              <div>
                <Image className="icon" src={item.peerMeta.icons[0] || ''} />
              </div>

              <div className="name">
                <span>{item.peerMeta.name}</span>
              </div>

              <div>
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    DAppVM.disconnect(item.key);
                  }}
                >
                  <Feather icon="trash-2" size={16} strokeWidth={1.5} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
