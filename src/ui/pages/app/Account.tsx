import './Account.css';

import { Copy, NavBar } from '../../components';
import React, { useState } from 'react';

import { Application } from '../../viewmodels/Application';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import QRCode from 'qrcode.react';
import Shell from '../../bridges/Shell';
import { convertToAccountUrl } from '../../../misc/Url';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default ({ app, networksVM }: { app: Application; networksVM: NetworksVM }) => {
  const { t } = useTranslation();
  const { currentAccount, name } = app.currentWallet;

  const [walletName, setWalletName] = useState(name);
  const [timer, setTimer] = useState(null);
  const address = currentAccount.address;

  useEffect(() => {
    clearTimeout(timer);
    setTimer(setTimeout(() => app.currentWallet.changeName(walletName), 1000));
  }, [walletName]);

  return (
    <div className="page account">
      <NavBar title={t('Account')} onBackClick={() => app.history.goBack()} />

      <div className="content">
        <div>
          <input
            type="text"
            maxLength={10}
            defaultValue={currentAccount.name || currentAccount.ens || `Account ${currentAccount.accountIndex}`}
            onChange={(e) => (currentAccount.name = e.target.value)}
          />
          <QRCode value={address} size={150} bgColor="transparent" />
          <div className="addr">
            <span onClick={(_) => Shell.open(convertToAccountUrl(networksVM.currentChainId, address))}>{address}</span>
            <Copy content={address} />
          </div>
        </div>
      </div>

      <div className="footer">
        <input type="text" maxLength={18} defaultValue={walletName || name} onChange={(e) => setWalletName(e.target.value)} />
      </div>
    </div>
  );
};
