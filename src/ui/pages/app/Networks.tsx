import './Networks.css';

import { Application } from '../../viewmodels/Application';
import { NavBar } from '../../components';
import { NetworkIcons } from '../../misc/Icons';
import { Networks } from '../../../common/Networks';
import React from 'react';
import { getChainProviderMaskUrl } from '../../../common/Provider';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { t } = useTranslation();

  return (
    <div className="page networks">
      <NavBar title={t('Networks')} onBackClick={() => app.history.goBack()} />

      <div className="list">
        {Networks.map((n, i) => {
          return (
            <div
              className={`network ${i % 2 === 0 ? 'even' : ''}`}
              key={n.network}
              onClick={(_) => app.history.push(`/network/${n.chainId}`)}
            >
              <div className="line1">
                <img src={NetworkIcons(n.network)} alt="" />
                {n.network}
              </div>
              <div className="line2">
                <span></span>
                {getChainProviderMaskUrl(n.chainId)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
