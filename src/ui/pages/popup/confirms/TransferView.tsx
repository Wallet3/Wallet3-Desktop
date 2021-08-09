import React, { createRef } from 'react';
import { formatAddress, formatValue } from '../../../misc/Formatter';

import { ConfirmVM } from '../../../viewmodels/popups/ConfirmVM';
import { CryptoIcons } from '../../../misc/Icons';
import Feather from 'feather-icons-react';
import { Image } from '../../../components';
import Shell from '../../../bridges/Shell';
import { convertToAccountUrl } from '../../../../misc/Url';
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
    recipientAddress,
    recipient,
    amount,
    method,
    tokenSymbol,
    networkSymbol,
    gas,
    gasPrice,
    maxFeePerGas,
    priorityPrice,
    maxFee,
    nonce,
    totalValue,
    chainId,
    verifiedName,
    to,
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
            className={`${verifiedName && method === 'Contract Interaction' ? 'verified' : ''}`}
            title={recipientAddress || to}
            onClick={(_) => Shell.open(convertToAccountUrl(chainId, recipientAddress || to))}
          >
            {formatAddress(recipientAddress, 8, 5) || verifiedName || recipient || formatAddress(to, 8, 5)}
            {verifiedName && method === 'Contract Interaction' ? <Feather icon="award" size={12} /> : undefined}
          </span>
        </div>

        <div className="amount">
          <span>{t('Amount')}:</span>
          <div className="numeric" title={`${amount} ${tokenSymbol}`}>
            <span>{amount}</span>
            <span>
              <img src={CryptoIcons(tokenSymbol)} alt={tokenSymbol} /> {tokenSymbol}
            </span>
          </div>
        </div>

        {gasPrice ? (
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
        ) : undefined}

        {maxFeePerGas ? (
          <div>
            <span>{t('Max Gas Fee')}:</span>
            <div>
              <input type="text" defaultValue={maxFeePerGas} onChange={(e) => implVM.setMaxGasPrice(e.target.value)} />
              <span>
                Gwei <Feather icon="edit-3" size={12} />
              </span>
            </div>
          </div>
        ) : undefined}

        {priorityPrice ? (
          <div>
            <span>{t('Gas Tip')}:</span>
            <div>
              <input type="text" defaultValue={priorityPrice} onChange={(e) => implVM.setPriorityPrice(e.target.value)} />
              <span>
                Gwei <Feather icon="edit-3" size={12} />
              </span>
            </div>
          </div>
        ) : undefined}

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
            <span>{formatValue(maxFee)}</span>
            <span>{networkSymbol}</span>
          </div>
        </div>

        <div>
          <span>{t('Total')}:</span>
          <div className="numeric" title={`${totalValue} ${tokenSymbol}`}>
            <span>{formatValue(totalValue)}</span>
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
