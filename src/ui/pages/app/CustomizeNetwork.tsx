import './CustomizeNetwork.css';

import React, { useRef } from 'react';
import { getChainProviderMaskUrl, saveCustomizedRPC } from '../../../common/Provider';

import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import { NavBar } from '../../components';
import { NetworkIcons } from '../../misc/Icons';
import { Networks } from '../../../common/Networks';
import { getExplorerUrl } from '../../../misc/Url';
import { useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default ({ app }: { app: Application }) => {
  const { t } = useTranslation();
  const { chainId } = useRouteMatch().params as { chainId?: string };

  const network = Networks.find((n) => `${n.chainId}` === chainId);

  const rpcRef = useRef<HTMLInputElement>();
  const explorerRef = useRef<HTMLInputElement>();

  const save = () => {
    saveCustomizedRPC(network.chainId, rpcRef.current.value, explorerRef.current.value);
    app.history.goBack();
  };

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
            <input ref={rpcRef} type="text" defaultValue={getChainProviderMaskUrl(network.chainId)} />{' '}
            <Feather icon="edit-3" size={12} />
          </div>
        </div>

        <div className="app-item">
          <span>{t('Block Explorer')}:</span>
          <div>
            <input ref={explorerRef} type="text" defaultValue={getExplorerUrl(network.chainId)} />{' '}
            <Feather icon="edit-3" size={12} />
          </div>
        </div>
      </div>

      <button onClick={(_) => save()}>{t('Save')}</button>
    </div>
  );
};
