import { Application } from '../../viewmodels/Application';
import { NavBar } from '../../components';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { t } = useTranslation();

  return (
    <div className="page networks">
      <NavBar title={t('Add Tokens')} onBackClick={() => app.history.goBack()} />
    </div>
  );
};
