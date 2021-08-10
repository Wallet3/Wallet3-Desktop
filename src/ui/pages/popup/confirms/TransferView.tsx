import React, { createRef } from 'react';
import { formatAddress, formatNum, formatValue } from '../../../misc/Formatter';

import AnimatedNumber from 'react-animated-number';
import { ConfirmVM } from '../../../viewmodels/popups/ConfirmVM';
import { CryptoIcons } from '../../../misc/Icons';
import Feather from 'feather-icons-react';
import { Gwei_1 } from '../../../../gas/Gasnow';
import { Image } from '../../../components';
import Shell from '../../../bridges/Shell';
import { convertToAccountUrl } from '../../../../misc/Url';
import fire from '../../../../assets/icons/app/fire.svg';
import gem from '../../../../assets/icons/app/gem.svg';
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
    suggestedPriorityFee,
    nextBlockBaseFee,
    priorityPrice,
    maxFee,
    nonce,
    totalValue,
    eip1559,
    chainId,
    verifiedName,
    to,
  } = implVM;

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
              {formatAddress(implVM.args.walletConnect.app.name, 12, 10)}
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
            <span>{formatValue(amount)}</span>
            <span>
              <img src={CryptoIcons(tokenSymbol)} alt={tokenSymbol} /> {tokenSymbol}
            </span>
          </div>
        </div>

        {eip1559 ? undefined : (
          <div>
            <span>{t('Gas Price')}:</span>
            <div>
              <input
                // ref={gasPriceRef}
                type="text"
                defaultValue={gasPrice}
                onChange={(e) => implVM.setGasPrice(e.target.value)}
              />
              <span>
                Gwei <Feather icon="edit-3" size={12} />
              </span>
            </div>
          </div>
        )}

        {eip1559 ? (
          <div className="next-block-fee">
            <span>{t('Next Block Fee')}:</span>
            <div>
              <span className="base-fee-value" title={t('Next Block Base Fee')}>
                <img src={fire} alt="Burn" />
                <AnimatedNumber value={nextBlockBaseFee / Gwei_1} formatValue={(n) => formatNum(n, '')} />
                <span>Gwei</span>
              </span>
              <span className="plus">+</span>
              <span className="priority-fee-value" title={t('Next Block Priority Fee')}>
                <img src={gem} alt="Gem" />
                <AnimatedNumber value={suggestedPriorityFee / Gwei_1} formatValue={(n) => formatNum(n, '')} />
                <span>Gwei</span>
              </span>
            </div>
          </div>
        ) : undefined}

        {eip1559 ? (
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

        {eip1559 ? (
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
            <input type="text" defaultValue={gas} onChange={(e) => implVM.setGas(e.target.value)} />
            <span>
              <Feather icon="edit-3" size={12} />
            </span>
          </div>
        </div>

        <div>
          <span>{t('Nonce')}:</span>
          <div>
            <input type="text" defaultValue={nonce} onChange={(e) => implVM.setNonce(e.target.value)} />
            <span>
              <Feather icon="edit-3" size={12} />
            </span>
          </div>
        </div>

        <div>
          <span>{t('Max Fee')}:</span>
          <div className="numeric">
            <AnimatedNumber value={Number.parseFloat(maxFee)} formatValue={(n: number) => formatValue(n)} />
            <span>{networkSymbol}</span>
          </div>
        </div>

        <div>
          <span>{t('Total')}:</span>
          <div className="numeric" title={`${totalValue} ${tokenSymbol}`}>
            <AnimatedNumber value={Number.parseFloat(totalValue)} formatValue={(n: number) => formatValue(n)} />
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
