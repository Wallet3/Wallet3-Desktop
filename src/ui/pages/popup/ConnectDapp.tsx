import './ConnectDapp.css';
import '@szhsin/react-menu/dist/index.css';

import { Image, NetworkMenu, PopupTitle } from '../../components';
import { PublicNetworks, Testnets } from '../../../common/Networks';
import React, { useEffect } from 'react';

import { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import { formatAddress } from '../../misc/Formatter';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

export default observer(({ app }: { app: ApplicationPopup }) => {
  const { connectDappVM: vm, currentWallet } = app;
  const { t } = useTranslation();

  useEffect(() => {
    document.onkeydown = (ev) => {
      if (ev.code !== 'Enter') return;

      ev.preventDefault();
      ev.stopPropagation();

      vm?.approve();
      window.close();
    };
  });

  return (
    <div className="page connectdapp">
      <PopupTitle title={t('ConnectDapp')} icon="anchor" />

      <div className="content">
        <div className="networks">
          <div className="addr" title={currentWallet?.currentAccount?.address}>
            {formatAddress(currentWallet?.currentAccount?.address, 7, 5)}
          </div>

          <span></span>

          <NetworkMenu
            currentChainId={vm.userChainId}
            publicNetworks={PublicNetworks}
            testnets={Testnets}
            showAutoSwitch
            onNetworkSelected={(id) => vm.setChainId(id)}
          />
        </div>

        <div className="appinfo">
          <Image src={vm.icon} alt={vm.appName} />
          <div>{vm.appName}</div>
          <div className="desc" title={vm.desc}>
            {vm.desc}
          </div>
          <div>{vm.url}</div>
        </div>
      </div>

      <div className="actions">
        <button
          onClick={(_) => {
            vm.reject();
            window.close();
          }}
        >
          {t('Reject')}
        </button>
        <button
          className="positive"
          onClick={(_) => {
            vm.approve();
            window.close();
          }}
        >
          {t('Approve')}
        </button>
      </div>
    </div>
  );
});
