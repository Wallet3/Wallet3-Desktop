import './Welcome.css';

import { Link } from 'react-router-dom';
import { Logo } from '../../components';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default () => {
  const { t } = useTranslation();

  return (
    <div className="page welcome">
      <div className="brand">
        <Logo className="logo animate__animated animate__fadeInUp" width={152} height={80} opacity={0} />
        <div className="slogan animate__animated animate__fadeInUp animate__delay-1s" style={{ opacity: 0 }}>
          A Secure Wallet for Bankless Era
        </div>
      </div>

      <div className="actions">
        <Link className="button positive animate__animated animate__fadeInUp animate__delay-1s" to="/generate">
          {t('Create a new wallet')}
        </Link>
        <Link className="button animate__animated animate__fadeInUp animate__delay-1s" to="/import">
          {t('Import wallet')}
        </Link>
      </div>
    </div>
  );
};
