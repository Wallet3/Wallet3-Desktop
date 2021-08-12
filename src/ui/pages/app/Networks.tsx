import './Networks.css';

import { Application } from '../../viewmodels/Application';
import { NavBar } from '../../components';
import { NetworkIcons } from '../../misc/Icons';
import { Networks } from '../../../common/Networks';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { t } = useTranslation();

  return (
    <div className="page networks">
      <NavBar title={t('Networks')} onBackClick={() => app.history.goBack()} />

      <div className="list">
        {Networks.map((n) => {
          return (
            <div className="network" key={n.network}>
              <div>
                <img src={NetworkIcons(n.network)} alt="" />
                <span>{n.network}</span>
              </div>
              <div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
