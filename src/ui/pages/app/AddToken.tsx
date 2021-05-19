import './AddToken.css';

import { Application } from '../../viewmodels/Application';
import { NavBar } from '../../components';
import React from 'react';
import { WalletVM } from '../../viewmodels/WalletVM';

export default ({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const { currentAccount } = walletVM;

  return (
    <div className="page add-token">
      <NavBar title="Add Token" onBackClick={() => app.history.goBack()} />

      <div className="content">
        <input type="text" placeholder="ERC20 Contract Address" />

        <div className="form">
          <div>
            <span>Name:</span>
            <span>---</span>
          </div>

          <div>
            <span>Symbol:</span>
            <span>---</span>
          </div>

          <div>
            <span>Decimals:</span>
            <span>---</span>
          </div>

          <div>
            <span>Balance:</span>
            <span>---</span>
          </div>
        </div>
      </div>

      <button>Save</button>
    </div>
  );
};
