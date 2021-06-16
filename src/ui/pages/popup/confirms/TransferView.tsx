import React, { createRef } from 'react';

import { ConfirmVM } from '../../../viewmodels/popups/ConfirmVM';
import { CryptoIcons } from '../../../misc/Icons';
import Feather from 'feather-icons-react';
import { Image } from '../../../components';
import Shell from '../../../bridges/Shell';
import { convertToAccountUrl } from '../../../../misc/Url';
import { formatAddress } from '../../../misc/Formatter';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface Props {
  implVM: ConfirmVM;
  onContinue?: () => void;
  onReject?: () => void;
}

export default observer(({ implVM, onContinue, onReject }: Props) => {
  const { t } = useTranslation();

  const {
    receipientAddress,
    receipient,
    amount,
    tokenSymbol,
    networkSymbol,
    gas,
    gasPrice,
    maxFee,
    nonce,
    totalValue,
    chainId,
    verifiedName,
  } = implVM;

  const gasPriceRef = createRef<HTMLInputElement>();
  const gasLimitRef = createRef<HTMLInputElement>();
  const nonceRef = createRef<HTMLInputElement>();

  return (
    <div className="details">
      <div className="form">
        {implVM.args.walletConnect?.app ? (
          <div>
            <span>{t('DApp')}:</span>
            <span>
              <Image
                className="dapp-icon"
                src={implVM.args.walletConnect.app.icons[0] || ''}
                alt={implVM.args.walletConnect.app.name}
              />
              {implVM.args.walletConnect.app.name}
            </span>
          </div>
        ) : undefined}

        <div className={`to`}>
          <span>{t('To')}:</span>
          <span
            className={`${verifiedName ? 'verified' : ''}`}
            title={receipientAddress}
            onClick={(_) => Shell.open(convertToAccountUrl(chainId, receipientAddress))}
          >
            {verifiedName || receipient || formatAddress(receipientAddress, 8, 5)}
            {verifiedName ? <Feather icon="award" size={12} /> : undefined}
          </span>
        </div>

        <div>
          <span>{t('Amount')}:</span>
          <div className="numeric" title={`${amount} ${tokenSymbol}`}>
            <span>{amount}</span>
            <span>
              <img src={CryptoIcons(tokenSymbol)} alt={tokenSymbol} /> {tokenSymbol}
            </span>
          </div>
        </div>

        <div>
          <span>{t('Gas Price')}:</span>
          <div>
            <input
              ref={gasPriceRef}
              type="text"
              defaultValue={gasPrice}
              onChange={(e) => implVM.setGasPrice(e.target.value)}
            />
            <span>
              Gwei <Feather icon="edit-3" size={12} />
            </span>
          </div>
        </div>

        <div>
          <span>{t('Gas Limit')}:</span>
          <div>
            <input ref={gasLimitRef} type="text" defaultValue={gas} onChange={(e) => implVM.setGas(e.target.value)} />
            <span>
              <Feather icon="edit-3" size={12} />
            </span>
          </div>
        </div>

        <div>
          <span>{t('Nonce')}:</span>
          <div>
            <input ref={nonceRef} type="text" defaultValue={nonce} onChange={(e) => implVM.setNonce(e.target.value)} />
            <span>
              <Feather icon="edit-3" size={12} />
            </span>
          </div>
        </div>

        <div>
          <span>{t('Max Fee')}:</span>
          <div className="numeric">
            <span>{maxFee}</span>
            <span>{networkSymbol}</span>
          </div>
        </div>

        <div>
          <span>{t('Total')}:</span>
          <div className="numeric" title={`${totalValue} ${tokenSymbol}`}>
            <span>{totalValue}</span>
            <span>{networkSymbol}</span>
          </div>
        </div>
      </div>

      <div className="actions">
        <button onClick={(_) => onReject?.()}>{t('Cancel')}</button>
        <button className="positive" disabled={!implVM.isValid || implVM.insufficientFee} onClick={(_) => onContinue?.()}>
          {implVM.insufficientFee ? t('INSUFFICIENT FEE') : t('Continue')}
        </button>
      </div>
    </div>
  );
});
