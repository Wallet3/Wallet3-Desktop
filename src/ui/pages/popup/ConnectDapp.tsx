import './ConnectDapp.css';

import { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import { PopupTitle } from '../../components';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

export default observer(({ app }: { app: ApplicationPopup }) => {
  const { connectDappVM: vm } = app;
  const { t } = useTranslation();

  return (
    <div className="page connectdapp">
      <PopupTitle title={t('ConnectDapp')} icon="anchor" />

      <div className="content">
        <img src={vm.icon} alt={vm.appName} />
        <div>{vm.appName}</div>
        <div className="desc" title={vm.desc}>
          {vm.desc}
        </div>
        <div>{vm.url}</div>
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
