import './Reset.css';

import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import { NavBar } from '../../components';
import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { t } = useTranslation();
  const { authKey } = useRouteMatch().params as { authKey: string };

  const reset = async () => {
    const approved = await app.ask({
      title: t('Reset'),
      message: t('Your all data will be deleted, are you sure?'),
      icon: 'alert-triangle',
    });

    if (!approved) return;

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
