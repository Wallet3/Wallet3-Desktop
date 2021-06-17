import './About.css';

import { Application } from '../../viewmodels/Application';
import DeBank from '../../../assets/icons/3rd/debank.svg';
import Feather from 'feather-icons-react';
import { NavBar } from '../../components';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { t } = useTranslation();

  return (
    <div className="page about">
      <NavBar title={t('About')} onBackClick={() => app.history.goBack()} />

      <div className="content">
        <p>Wallet 3 - {t('A secure Wallet for Bankless Era')}</p>

        <h3>{t('Features')}</h3>
        <ul>
          <li>
            <Feather icon="box" size={14} /> {t('Manage all your Ethereum assets in one place')}
          </li>
          <li>
            <Feather icon="link-2" size={14} /> {t('Connect DeFi apps with WalletConnect')}
          </li>
          <li>
            <Feather icon="cpu" size={14} /> {t('Support Layer2 and EVM-compatible chains')}
          </li>
          <li>
            <Feather icon="shield" size={14} /> {t('Built for Security')}
          </li>
        </ul>

        <h3>{t('Data Providers')}</h3>
        <div className="data-providers">
          <img src={DeBank} alt="DeBank" />
        </div>

        <h3>Copyright</h3>
        <span className="copyright">&copy; 2021 ChainBow Co, Ltd. Business Source License.</span>
      </div>
    </div>
  );
};
