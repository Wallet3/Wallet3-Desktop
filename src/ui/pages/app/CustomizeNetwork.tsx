import './CustomizeNetwork.css';

import { Application } from '../../viewmodels/Application';
import { NavBar } from '../../components';
import { NetworkIcons } from '../../misc/Icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { t } = useTranslation();

  return (
    <div className="page customize-network">
      <NavBar title={t('Networks')} onBackClick={() => app.history.goBack()} />

      <div></div>
    </div>
  );
};
