import './PendingTx.css';

import React, { useEffect } from 'react';

import { Application } from '../../viewmodels/Application';
import { GasnowWs } from '../../../api/Gasnow';
import { NavBar } from '../../components';
import { Networks } from '../../viewmodels/NetworksVM';
import { WalletVM } from '../../viewmodels/WalletVM';

export default ({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const { pendingTxVM: vm } = walletVM;

  const chain = Networks.find((n) => n?.chainId === vm.chainId);
  return (
    <div className="page pending-tx">
      <NavBar title="Pending Transaction" onBackClick={() => app.history.goBack()} />

      <div className="form">
        <div>
          <span>Chain:</span>
          <span>{chain.network}</span>
        </div>

        <div>
          <span>From:</span>
          <span>{vm?.from}</span>
        </div>

        <div>
          <span>To:</span>
          <span>{vm?.to}</span>
        </div>

        <div>
          <span>Value:</span>
          <span>{`${vm?.value} ${chain.symbol}`}</span>
        </div>

        <div>
          <span>Gas Limit:</span>
          <span>{vm?.gasLimit}</span>
        </div>

        <div>
          <span>Gas Price:</span>
          <span>{`${vm?.gasPrice / GasnowWs.gwei_1} Gwei`}</span>
        </div>

        <div>
          <span>Nonce:</span>
          <span>{vm?.nonce}</span>
        </div>

        <div>
          <div>Data:</div>
          <div>{vm?.data}</div>
        </div>
      </div>

      <div className="actions">
        <button>Cancel Tx</button>
        <button>Speed Up</button>
      </div>
    </div>
  );
};
