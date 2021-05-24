import './Reset.css';

import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import { NavBar } from '../../components';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { t } = useTranslation();

  const reset = async () => {
    const params = new URLSearchParams(window.location.search);
    const authKey = params.get('authKey');

    if (await app.reset(authKey)) {
      app.history.push('/welcome');
    }
  };

  return (
    <div className="page reset">
      <NavBar title={t('Reset')} onBackClick={() => app.history.goBack()} />
      <div className="content">
        <Feather icon="alert-triangle" size={64} strokeWidth={1} />
        <p>
          {t('Reset_Tip1')} <br />
          {t('Reset_Tip2')}
        </p>
      </div>
      <button onClick={(_) => reset()}>{t('Reset')}</button>
    </div>
  );
};
