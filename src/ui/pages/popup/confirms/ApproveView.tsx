import React, { useEffect } from 'react';

import { ConfirmVM } from '../../../viewmodels/ConfirmVM';
import { CryptoIcons } from '../../../misc/Icons';
import Feather from 'feather-icons-react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface Props {
  confirmVM: ConfirmVM;
  onReject?: () => void;
  onContinue?: () => void;
}

export default observer(({ confirmVM, onReject, onContinue }: Props) => {
  const { approveToken, tokenSymbol, gas, gasPrice, maxFee, nonce, totalValue, networkSymbol } = confirmVM;
  const { t } = useTranslation();

  useEffect(() => {
    window.resizeTo(360, 375);
  }, []);

  return (
    <div className="details">
      <div className="form">
        <div className="attention">{t('Approve_Tip')}</div>

        <div>
          <span>{t('Spender')}:</span>
          <span>{confirmVM.approveToken.spender}</span>
        </div>

        <div>
          <span>{t('Funds Limit')}:</span>
          <span>
            <input
              type="text"
              className={`funds-limit ${approveToken.isMax ? 'max' : ''}`}
              defaultValue={confirmVM.approveToken.limitAmount}
              onChange={(e) => confirmVM.setApproveAmount(e.target.value)}
            />
            <img src={CryptoIcons(tokenSymbol)} alt={tokenSymbol} /> {tokenSymbol}
          </span>
        </div>

        <div>
          <span>{t('Gas Price')}:</span>
          <div>
            <input type="text" defaultValue={gasPrice} onChange={(e) => confirmVM.setGasPrice(e.target.value)} />
            <span>
              Gwei <Feather icon="edit-3" size={12} />
            </span>
          </div>
        </div>

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

        <div>
          <span>{t('Max Fee')}:</span>
          <span>
            {maxFee} {networkSymbol}
          </span>
        </div>

        <div>
          <span>{t('Total')}:</span>
          <span>
            {totalValue} {networkSymbol}
          </span>
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
