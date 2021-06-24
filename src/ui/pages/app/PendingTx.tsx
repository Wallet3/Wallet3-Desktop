import './PendingTx.css';

import { Application } from '../../viewmodels/Application';
import { NavBar } from '../../components';
import React from 'react';
import TxDetails from './components/TxDetails';
import { WalletVM } from '../../viewmodels/WalletVM';
import { useTranslation } from 'react-i18next';

export default ({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const { pendingTxVM: vm } = walletVM;
  const { t } = useTranslation();

  return (
    <div className="page pending-tx">
      <NavBar title={t('Pending Transaction')} onBackClick={() => app.history.goBack()} />

      <TxDetails
        chainId={vm.chainId}
        from={vm.from}
        to={vm.to}
        hash={vm.hash}
        gasLimit={vm.gasLimit}
        gasPriceGwei={vm.gasPriceGwei}
        data={vm.data}
        nonce={vm.nonce}
        value={vm.value}
      />

      <div className="actions">
        <button onClick={(_) => vm.cancelTx().then(() => app.history.goBack())}>
          <span>{t('Cancel Tx')}</span>
        </button>
        <button onClick={(_) => vm.speedUp().then(() => app.history.goBack())}>
          <span>{t('Speed Up')}</span>
        </button>
      </div>
    </div>
  );
};
