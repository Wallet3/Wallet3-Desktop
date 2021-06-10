import './GenerateMnemonic.css';

import React, { useEffect, useState } from 'react';

import { Application } from '../../viewmodels/Application';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import Mnemonic from '../../components/Mnemonic';
import { MnemonicVM } from '../../viewmodels/MnemonicVM';
import { NavBar } from '../../components';
import { observer } from 'mobx-react-lite';
import shell from '../../bridges/Shell';
import { useTranslation } from 'react-i18next';

export default observer(({ app, mnVM }: { app: Application; mnVM: MnemonicVM }) => {
  const { t } = useTranslation();

  useEffect(() => {
    mnVM.requestMnemonic(12);
    return () => mnVM.clean();
  }, [mnVM]);

  const [mnLength, setMnLength] = useState(12);

  return (
    <div className="page generate">
      <div>
        <NavBar title={t('Mnemonic')} onBackClick={() => app.history.goBack()} />

        <h5>{t('Security Tips')}</h5>
        <ul>
          <li>{t('Mn_Sec_Tip_1')}</li>
          <li>{t('Mn_Sec_Tip_2')}</li>
        </ul>
      </div>

      <div className="seeds no-drag">
        <Mnemonic phrases={mnVM.phrases} />

        <div className="actions">
          <div className="addr" onClick={(_) => shell.open(`https://etherscan.io/address/${mnVM.address}`)}>
            <span>{t('Address')}: </span>
            <span className="addr-value" title={mnVM.address}>
              {mnVM.address}
            </span>
          </div>

          <div className="switch">
            <span
              className={`button ${mnLength === 12 ? 'active' : ''}`}
              onClick={(_) => {
                setMnLength(12);
                mnVM.requestMnemonic(12);
              }}
            >
              12
            </span>
            <span> | </span>
            <span
              className={`button ${mnLength === 24 ? 'active' : ''}`}
              onClick={(_) => {
                setMnLength(24);
                mnVM.requestMnemonic(24);
              }}
            >
              24
            </span>
          </div>

          <div className="icon">
            <span className="button" onClick={(_) => mnVM.requestMnemonic(mnLength)}>
              <FeatherIcon icon="refresh-cw" size="12" />
            </span>
          </div>
        </div>
      </div>

      <div className="padding"></div>

      <Link className="button" to="/setupPassword">
        {t('Next')}
      </Link>
    </div>
  );
});
