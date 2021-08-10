import React, { useEffect } from 'react';
import { formatAddress, formatNum, formatValue } from '../../../misc/Formatter';

import AnimatedNumber from 'react-animated-number';
import { ConfirmVM } from '../../../viewmodels/popups/ConfirmVM';
import { CryptoIcons } from '../../../misc/Icons';
import { CurrencyVM } from '../../../viewmodels/settings/CurrencyVM';
import Feather from 'feather-icons-react';
import { Gwei_1 } from '../../../../gas/Gasnow';
import KnownAddresses from '../../../misc/KnownAddresses';
import Shell from '../../../bridges/Shell';
import { convertToAccountUrl } from '../../../../misc/Url';
import fire from '../../../../assets/icons/app/fire.svg';
import gem from '../../../../assets/icons/app/gem.svg';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface Props {
  confirmVM: ConfirmVM;
  currencyVM: CurrencyVM;
  onReject?: () => void;
  onContinue?: () => void;
}

export default observer(({ confirmVM, onReject, onContinue, currencyVM }: Props) => {
  const {
    approveToken,
    tokenSymbol,
    gas,
    gasPrice,
    eip1559,
    maxFeePerGas,
    priorityPrice,
    nextBlockBaseFee,
    suggestedPriorityFee,
    maxFee,
    nonce,
    totalValue,
    networkSymbol,
    verifiedName,

    chainId,
  } = confirmVM;
  const { t } = useTranslation();

  useEffect(() => {
    window.resizeTo(360, eip1559 ? 415 : 365);
  }, []);

  return (
    <div className="details">
      <div className="form">
        <div className="attention">{t('Approve_Tip')}</div>

        <div>
          <span>{t('Spender')}:</span>
          <span
            className={`spender ${verifiedName ? 'verified' : ''}`}
            title={approveToken.spender}
            onClick={(_) => Shell.open(convertToAccountUrl(chainId, approveToken?.spender))}
          >
            {KnownAddresses[approveToken?.spender] || formatAddress(approveToken?.spender, 8, 5)}
            {KnownAddresses[approveToken?.spender] ? <Feather icon="award" size={12} /> : undefined}
          </span>
        </div>

        <div>
          <span>{t('Funds Limit')}:</span>
          <div className="funds-limit" title={`${approveToken.limitAmount} ${tokenSymbol}`}>
            <input
              type="text"
              className={`funds-limit ${approveToken.isMax ? 'max' : ''}`}
              defaultValue={approveToken.isMax ? (t('Unlimited') as string) : approveToken.limitAmount}
              onChange={(e) => confirmVM.setApproveAmount(e.target.value)}
            />
            <img src={CryptoIcons(tokenSymbol)} alt={tokenSymbol} /> {tokenSymbol}
          </div>
        </div>

        {eip1559 ? undefined : (
          <div>
            <span>{t('Gas Price')}:</span>
            <div>
              <input type="text" defaultValue={gasPrice} onChange={(e) => confirmVM.setGasPrice(e.target.value)} />
              <span>
                Gwei <Feather icon="edit-3" size={12} />
              </span>
            </div>
          </div>
        )}

        {eip1559 ? (
          <div>
            <span>{t('Max Gas Fee')}:</span>
            <div>
              <input type="text" defaultValue={maxFeePerGas} onChange={(e) => confirmVM.setMaxGasPrice(e.target.value)} />
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
              <input type="text" defaultValue={priorityPrice} onChange={(e) => confirmVM.setPriorityPrice(e.target.value)} />
              <span>
                Gwei <Feather icon="edit-3" size={12} />
              </span>
            </div>
          </div>
        ) : undefined}

        <div>
          <span>{t('Gas Limit')}:</span>
          <div>
            <input type="text" defaultValue={gas} onChange={(e) => confirmVM.setGas(e.target.value)} />
            <span>
              <Feather icon="edit-3" size={12} />
            </span>
          </div>
        </div>

        <div>
          <span>{t('Nonce')}:</span>
          <div>
            <input type="text" defaultValue={nonce} onChange={(e) => confirmVM.setNonce(e.target.value)} />
            <span>
              <Feather icon="edit-3" size={12} />
            </span>
          </div>
        </div>

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

        <div>
          <span>{t('Max Fee')}:</span>
          <div>
            <span className="usd-value">
              {`(${(Number.parseFloat(maxFee) * currencyVM.getPrice(chainId)).toFixed(2)} USD)`}
            </span>
            <AnimatedNumber value={Number.parseFloat(maxFee)} formatValue={(n: number) => formatValue(n)} />
            <span>{networkSymbol}</span>
          </div>
        </div>

        <div>
          <span>{t('Total')}:</span>
          <div>
            <span className="usd-value">
              {`(${(Number.parseFloat(totalValue) * currencyVM.getPrice(chainId)).toFixed(2)} USD)`}
            </span>
            <AnimatedNumber value={Number.parseFloat(totalValue)} formatValue={(n: number) => formatValue(n)} />
            <span>{networkSymbol}</span>
          </div>
        </div>
      </div>

      <div className="actions">
        <button onClick={(_) => onReject?.()}>{t('Cancel')}</button>
        <button
          className="positive"
          onClick={(_) => onContinue?.()}
          disabled={!confirmVM.isValid || confirmVM.insufficientFee}
        >
          {t('Continue')}
        </button>
      </div>
    </div>
  );
});
