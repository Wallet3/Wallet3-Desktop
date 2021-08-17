import './CustomizeNetwork.css';

import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import { NavBar } from '../../components';
import { NetworkIcons } from '../../misc/Icons';
import { Networks } from '../../../common/Networks';
import React from 'react';
import { getChainProviderMaskUrl } from '../../../common/Provider';
import { getExplorerUrl } from '../../../misc/Url';
import { useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { t } = useTranslation();
  const { chainId } = useRouteMatch().params as { chainId?: string };
  console.log(useRouteMatch());

  const network = Networks.find((n) => `${n.chainId}` === chainId);

  return (
    <div className="page customize-network">
      <NavBar title={network.network} onBackClick={() => app.history.goBack()} />

      <div className="form">
        <div className="app-item">
          <span>ChainId:</span>
          <span>{network.chainId}</span>
        </div>

        <div className="app-item">
          <span>{t('Symbol')}:</span>
          <span>{network.symbol}</span>
        </div>

        <div className="app-item">
          <span>RPC URL:</span>
          <div>
            <input type="text" defaultValue={getChainProviderMaskUrl(network.chainId)} /> <Feather icon="edit-3" size={12} />
          </div>
        </div>

        <div className="app-item">
          <span>{t('Block Explorer')}:</span>
          <div>
            <input type="text" defaultValue={getExplorerUrl(network.chainId)} /> <Feather icon="edit-3" size={12} />
          </div>
        </div>
      </div>

      <button>{t('Save')}</button>
    </div>
  );
};
