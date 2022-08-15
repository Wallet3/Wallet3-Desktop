import React, { createRef } from 'react';
import { formatAddress, formatNum, formatValue } from '../../../misc/Formatter';

import AnimatedNumber from 'react-animated-number';
import { ConfirmVM } from '../../../viewmodels/popups/ConfirmVM';
import { CryptoIcons } from '../../../misc/Icons';
import { CurrencyVM } from '../../../viewmodels/settings/CurrencyVM';
import Feather from 'feather-icons-react';
import { Gwei_1 } from '../../../../gas/Gasnow';
import { Image } from '../../../components';
import Shell from '../../../bridges/Shell';
import { convertToAccountUrl } from '../../../../misc/Url';
import fire from '../../../../assets/icons/app/fire.svg';
import gem from '../../../../assets/icons/app/gem.svg';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { utils } from 'ethers';

interface Props {
  confirmVM: ConfirmVM;
  currencyVM: CurrencyVM;
  onContinue?: () => void;
  onReject?: () => void;
}

export default observer(({ confirmVM, onContinue, onReject, currencyVM }: Props) => {
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
    currentNetwork,
    chainId,
    verifiedName,
    to,
  } = confirmVM;
  const { eip1559 } = currentNetwork;

  return (
    <div className="details">
      <div className="form">
        {confirmVM.args.walletConnect?.app ? (
          <div>
            <span>{t('DApp')}:</span>
            <span>
              <Image
                className="dapp-icon"
                src={confirmVM.args.walletConnect.app.icons[0] || ''}
                alt={confirmVM.args.walletConnect.app.name}
              />
              {formatAddress(confirmVM.args.walletConnect.app.name, 12, 10)}
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
                onChange={(e) => confirmVM.setGasPrice(e.target.value)}
              />
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
          <div className="numeric">
            <span className="usd-value">
              {`(${(Number.parseFloat(maxFee) * currencyVM.getPrice(chainId)).toFixed(2)} USD)`}
            </span>
            <AnimatedNumber value={Number.parseFloat(maxFee)} formatValue={(n: number) => formatValue(n)} />
            <span>{networkSymbol}</span>
          </div>
        </div>

        <div>
          <span>{t('Total')}:</span>
          <div className="numeric" title={`${totalValue} ${tokenSymbol}`}>
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
          disabled={!confirmVM.isValid || confirmVM.insufficientFee}
          onClick={(_) => onContinue?.()}
        >
          {confirmVM.insufficientFee ? t('INSUFFICIENT FEE') : t('Continue')}
        </button>
      </div>
    </div>
  );
});
