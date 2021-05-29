import './PendingTx.css';

import { Application } from '../../viewmodels/Application';
import { CryptoIcons } from '../../misc/Icons';
import { GasnowWs } from '../../../gas/Gasnow';
import { NavBar } from '../../components';
import { Networks } from '../../viewmodels/NetworksVM';
import React from 'react';
import { WalletVM } from '../../viewmodels/WalletVM';
import { convertTxToUrl } from '../../../misc/Url';
import { formatAddress } from '../../misc/Formatter';
import shell from '../../bridges/Shell';
import { useTranslation } from 'react-i18next';

export default ({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const { pendingTxVM: vm } = walletVM;
  const { t } = useTranslation();

  const chain = Networks.find((n) => n?.chainId === vm.chainId);
  return (
    <div className="page pending-tx">
      <NavBar title={t('Pending Transaction')} onBackClick={() => app.history.goBack()} />

      <div className="form">
        <div>
          <span>{t('Network')}:</span>
          <span>
            <img src={CryptoIcons(chain.symbol)} alt="" />
            {chain.network}
          </span>
        </div>

        <div>
          <span>{t('Hash')}:</span>
          <span>{formatAddress(vm.hash)}</span>
        </div>

        <div>
          <span>{t('From')}:</span>
          <span title={vm?.from}>{formatAddress(vm.from)}</span>
        </div>

        <div>
          <span>{t('To')}:</span>
          <span title={vm?.to}>{formatAddress(vm.to)}</span>
        </div>

        <div>
          <span>{t('Value')}:</span>
          <span>{`${Number.parseFloat(vm?.value).toFixed(2)} ${chain.symbol}`}</span>
        </div>

        <div>
          <span>{t('Gas Limit')}:</span>
          <span>{vm?.gasLimit}</span>
        </div>

        <div>
          <span>{t('Gas Price')}:</span>
          <span>{`${vm?.gasPrice / GasnowWs.gwei_1} Gwei`}</span>
        </div>

        <div>
          <span>{t('Nonce')}:</span>
          <span>{vm?.nonce}</span>
        </div>

        <div className="data">
          <span>{t('Data')}:</span>
          <span>{vm?.data}</span>
        </div>

        <div>
          <span></span>
          <span className="link" onClick={(_) => shell.open(convertTxToUrl(vm._tx))}>
            {t('View on Etherscan')}
          </span>
        </div>
      </div>

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
