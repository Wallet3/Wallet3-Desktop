import './BackupMnemonic.css';

import React, { useEffect } from 'react';

import { Application } from '../../viewmodels/Application';
import Mnemonic from '../../components/Mnemonic';
import { MnemonicVM } from '../../viewmodels/MnemonicVM';
import { NavBar } from '../../components';
import { observer } from 'mobx-react-lite';
import { useRouteMatch } from 'react-router';
import { useTranslation } from 'react-i18next';

export default observer(({ app, mnVM }: { app: Application; mnVM: MnemonicVM }) => {
  const { t } = useTranslation();
  const { params } = useRouteMatch();
  const { authKey } = params as { authKey: string };

  useEffect(() => {
    mnVM.readMnemonic(authKey);
    return () => mnVM.clean();
  }, []);

  return (
    <div className="page backup-mnemonic">
      <NavBar title={t('Backup Mnemonic')} onBackClick={() => app.history.goBack()} />

      <div className="content">
        <div>
          <h5>{t('Security Tips')}</h5>
          <ul>
            <li>{t('Mn_Sec_Tip_1')}</li>
            <li>{t('Mn_Sec_Tip_2')}</li>
          </ul>
        </div>

        <Mnemonic phrases={mnVM.phrases} />
      </div>
    </div>
  );
});
