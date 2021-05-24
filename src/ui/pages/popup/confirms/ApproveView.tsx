import React, { useEffect } from 'react';

import { ConfirmVM } from '../../../viewmodels/ConfirmVM';
import { CryptoIcons } from '../../../misc/Icons';
import Feather from 'feather-icons-react';
import { observer } from 'mobx-react-lite';

interface Props {
  confirmVM: ConfirmVM;
  onReject?: () => void;
  onContinue?: () => void;
}

export default observer(({ confirmVM, onReject, onContinue }: Props) => {
  const { receiptAddress, receipt, approveToken, tokenSymbol, gas, gasPrice, maxFee, nonce, totalValue } = confirmVM;

  useEffect(() => {
    window.resizeTo(360, 375);
  }, []);

  return (
    <div className="details">
      <div className="form">
        <div className="attention">
          By granting this transaction, the spender can spend your funds without your knowledge. Please be careful to check
          the granting limit below.
        </div>

        <div>
          <span>Spender:</span>
          <span>{confirmVM.approveToken.spender}</span>
        </div>

        <div>
          <span>Funds Limit:</span>
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
          <span>Gas Price:</span>
          <div>
            <input type="text" defaultValue={gasPrice} onChange={(e) => confirmVM.setGasPrice(e.target.value)} />
            <span>
              Gwei <Feather icon="edit-3" size={12} />
            </span>
          </div>
        </div>

        <div>
          <span>Gas Limit:</span>
          <div>
            <input type="text" defaultValue={gas} onChange={(e) => confirmVM.setGas(e.target.value)} />
            <span>
              <Feather icon="edit-3" size={12} />
            </span>
          </div>
        </div>

        <div>
          <span>Nonce:</span>
          <div>
            <input type="text" defaultValue={nonce} onChange={(e) => confirmVM.setNonce(e.target.value)} />
            <span>
              <Feather icon="edit-3" size={12} />
            </span>
          </div>
        </div>

        <div>
          <span>Max Fee:</span>
          <span>{maxFee} ETH</span>
        </div>

        <div>
          <span>Total:</span>
          <span>{totalValue} ETH</span>
        </div>
      </div>
      <div className="actions">
        <button onClick={(_) => onReject?.()}>Cancel</button>
        <button
          className="positive"
          onClick={(_) => onContinue?.()}
          disabled={!confirmVM.isValid || confirmVM.insufficientFee}
        >
          Continue
        </button>
      </div>
    </div>
  );
});
