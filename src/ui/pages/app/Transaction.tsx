import './Transaction.css';

import { Application } from '../../viewmodels/Application';
import { NavBar } from '../../components';
import React from 'react';
import TxDetails from './components/TxDetails';
import { WalletVM } from '../../viewmodels/WalletVM';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default ({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const { pendingTxVM, historyTxsVM } = walletVM;
  const { t } = useTranslation();

  let vm = pendingTxVM || historyTxsVM.selectedTx;

  useEffect(() => {
    return () => walletVM.clean();
  }, []);

  return (
    <div className="page pending-tx">
      <NavBar title={t(pendingTxVM ? 'Pending Transaction' : 'History')} onBackClick={() => app.history.goBack()} />

      <TxDetails
        chainId={vm.chainId}
        from={vm.from}
        to={vm.to}
        hash={vm.hash}
        gasLimit={vm.gas}
        gasPrice={vm.gasPrice}
        data={vm.data}
        nonce={vm.nonce}
        status={vm.status}
        blockNumber={vm.blockNumber}
        value={vm.value}
      />

      {pendingTxVM ? (
        <div className="actions">
          <button onClick={(_) => pendingTxVM.cancelTx().then(() => app.history.goBack())}>
            <span>{t('Cancel Tx')}</span>
          </button>
          <button onClick={(_) => pendingTxVM.speedUp().then(() => app.history.goBack())}>
            <span>{t('Speed Up')}</span>
          </button>
        </div>
      ) : undefined}
    </div>
  );
};
