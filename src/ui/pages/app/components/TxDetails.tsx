import './TxDetails.css';

import { CryptoIcons } from '../../../misc/Icons';
import { Networks } from '../../../viewmodels/NetworksVM';
import React from 'react';
import { convertTxToUrl } from '../../../../misc/Url';
import { formatAddress } from '../../../misc/Formatter';
import { observer } from 'mobx-react-lite';
import shell from '../../../bridges/Shell';
import { useTranslation } from 'react-i18next';
import { utils } from 'ethers';

interface Props {
  chainId: number;
  hash?: string;
  from: string;
  to: string;
  value: string;
  gasLimit: number | string;
  gasPriceGwei: string | number;
  nonce: number;
  data: string;
}

export default observer((vm: Props) => {
  const { t } = useTranslation();
  const chain = Networks.find((n) => n?.chainId === vm.chainId);

  return (
    <div className="tx-details">
      <div>
        <span>{t('Network')}:</span>
        <span>
          <img src={CryptoIcons(chain.symbol)} alt="" />
          {chain.network}
        </span>
      </div>

      <div>
        <span>{t('Hash')}:</span>
        <span title={vm.hash}>{formatAddress(vm.hash)}</span>
      </div>

      <div>
        <span>{t('From')}:</span>
        <span title={vm.from}>{formatAddress(vm.from)}</span>
      </div>

      <div>
        <span>{t('To')}:</span>
        <span title={vm.to}>{formatAddress(vm.to)}</span>
      </div>

      <div>
        <span>{t('Value')}:</span>
        <span>{`${utils.formatEther(vm.value)} ${chain.symbol}`}</span>
      </div>

      <div>
        <span>{t('Gas Limit')}:</span>
        <span>{vm.gasLimit}</span>
      </div>

      <div>
        <span>{t('Gas Price')}:</span>
        <span>{`${vm.gasPriceGwei} Gwei`}</span>
      </div>

      <div>
        <span>{t('Nonce')}:</span>
        <span>{vm.nonce}</span>
      </div>

      <div className="data">
        <span>{t('Data')}:</span>
        <span>{vm?.data}</span>
      </div>

      <div>
        <span></span>
        <span className="link" onClick={(_) => shell.open(convertTxToUrl(vm))}>
          {t('View on Block Explorer')}
        </span>
      </div>
    </div>
  );
});
