import './BackupMnemonic.css';

import React, { useEffect } from 'react';

import { Application } from '../../viewmodels/Application';
import Mnemonic from '../../components/Mnemonic';
import { MnemonicVM } from '../../viewmodels/MnemonicVM';
import { NavBar } from '../../components';
import QRCode from 'qrcode.react';
import { observer } from 'mobx-react-lite';
import { useRouteMatch } from 'react-router';
import { useTranslation } from 'react-i18next';

export default observer(({ app, mnVM }: { app: Application; mnVM: MnemonicVM }) => {
  const { t } = useTranslation();
  const { params } = useRouteMatch();
  const { authKey } = params as { authKey: string };

  useEffect(() => {
    mnVM.readSecret(authKey);
    return () => mnVM.clean();
  }, []);

  return (
    <div className="page backup-mnemonic">
      <NavBar title={t('Backup Wallet')} onBackClick={() => app.history.goBack()} />

      <div className="content">
        <div>
          <h5>{t('Security Tips')}</h5>
          <ul>
            <li>{t('Mn_Sec_Tip_1')}</li>
            <li>{t('Mn_Sec_Tip_2')}</li>
          </ul>
        </div>

        {mnVM.privkey ? (
          <pre className="privkey">
            <span>{mnVM.privkey}</span>
          </pre>
        ) : (
          <Mnemonic phrases={mnVM.phrases} />
        )}

        {mnVM.phrases?.length > 0 && mnVM.isEnglish ? (
          <div className="mobile-sync">
            <QRCode value={`wallet3sync:${btoa(mnVM.phrases.join(','))}`} size={100} bgColor="transparent" color="#75869c" />

            <div className="tips">
              <p>{t('Mobile_sync_1')}</p>
              <p>{t('Mobile_sync_2')}</p>
              <p>{t('Mobile_sync_3')}</p>
            </div>
          </div>
        ) : undefined}
      </div>
    </div>
  );
});
