import './Account.css';

import { Logo, NavBar } from '../../components';
import React, { useState } from 'react';

import { Application } from '../../viewmodels/Application';
import CheckIcon from '../../../assets/icons/app/check.svg';
import Clipboard from '../../bridges/Clipboard';
import CopyIcon from '../../../assets/icons/app/copy.svg';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import QRCode from 'qrcode.react';
import Shell from '../../bridges/Shell';
import { WalletVM } from '../../viewmodels/WalletVM';
import { convertToAccountUrl } from '../../../misc/Url';

export default ({ app, walletVM, networksVM }: { app: Application; walletVM: WalletVM; networksVM: NetworksVM }) => {
  const [showCheck, setShowCheck] = useState(false);

  const { currentAccount } = walletVM;
  const address = currentAccount.address;

  return (
    <div className="page account">
      <NavBar title="Account" onBackClick={() => app.history.goBack()} />

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

            {showCheck ? (
              <img src={CheckIcon} alt="Copied" />
            ) : (
              <span
                onClick={(_) => {
                  Clipboard.writeText(address);
                  setShowCheck(true);
                  setTimeout(() => setShowCheck(false), 3000);
                }}
              >
                <img src={CopyIcon} alt="copy" />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="footer">
        <Logo width={64} fill={'#00000020'} />
      </div>
    </div>
  );
};
