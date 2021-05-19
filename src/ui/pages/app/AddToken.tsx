import './AddToken.css';

import { Application } from '../../viewmodels/Application';
import BarLoader from 'react-spinners/BarLoader';
import { NavBar } from '../../components';
import React from 'react';
import { WalletVM } from '../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';

export default observer(({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const { currentAccount } = walletVM;
  const { addTokenVM } = currentAccount;

  const Loader = () => <BarLoader width={24} height={2} />;
  return (
    <div className="page add-token">
      <NavBar title="Add Token" onBackClick={() => app.history.goBack()} />

      <div className="content">
        <input
          type="text"
          spellCheck={false}
          placeholder="ERC20 Contract Address"
          onChange={(e) => addTokenVM.inputAddress(e.target.value)}
        />

        <div className="form">
          <div>
            <span>Name:</span>
            {addTokenVM.loading ? <Loader /> : <span>{addTokenVM.name || '---'}</span>}
          </div>

          <div>
            <span>Symbol:</span>
            {addTokenVM.loading ? <Loader /> : <span>{addTokenVM.symbol || '---'}</span>}
          </div>

          <div>
            <span>Decimals:</span>
            {addTokenVM.loading ? <Loader /> : <span>{addTokenVM.decimals || '---'} </span>}
          </div>

          <div>
            <span>Balance:</span>
            {addTokenVM.loading ? <Loader /> : <span>{addTokenVM.balance || '---'}</span>}
          </div>
        </div>
      </div>

      <button
        disabled={!addTokenVM.isValid}
        onClick={(_) => {
          addTokenVM.save();
          app.history.goBack();
        }}
      >
        Save
      </button>
    </div>
  );
});
