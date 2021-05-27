import { Application } from '../../viewmodels/Application';
import { NavBar } from '../../components';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

export default observer(({ app }: { app: Application }) => {
  const { t } = useTranslation();

  return (
    <div className="page dapps">
      <NavBar title={t('Connected DApps')} onBackClick={() => app.history.goBack()} />
    </div>
  );
});
