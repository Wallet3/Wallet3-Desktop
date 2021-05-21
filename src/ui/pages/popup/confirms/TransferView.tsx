import React, { createRef } from 'react';

import { ConfirmVM } from '../../../viewmodels/ConfirmVM';
import { CryptoIcons } from '../../../misc/Icons';
import Feather from 'feather-icons-react';
import { observer } from 'mobx-react-lite';

export default observer(
  ({ implVM, onContinue, onReject }: { implVM: ConfirmVM; onContinue?: () => void; onReject?: () => void }) => {
    const { receiptAddress, receipt, amount, tokenSymbol, gas, gasPrice, maxFee, nonce, totalValue } = implVM;

    const gasPriceRef = createRef<HTMLInputElement>();
    const gasLimitRef = createRef<HTMLInputElement>();
    const nonceRef = createRef<HTMLInputElement>();

    return (
      <div className="details">
        <div className="form">
          <div>
            <span>Recipient:</span>
            <span title={receiptAddress}>{receipt}</span>
          </div>

          <div>
            <span>Amount:</span>
            <span>
              {amount} <img src={CryptoIcons(tokenSymbol)} alt={tokenSymbol} /> {tokenSymbol}
            </span>
          </div>

          <div>
            <span>Gas Price:</span>
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
            <span>Gas Limit:</span>
            <div>
              <input ref={gasLimitRef} type="text" defaultValue={gas} onChange={(e) => implVM.setGas(e.target.value)} />
              <span>
                <Feather icon="edit-3" size={12} />
              </span>
            </div>
          </div>

          <div>
            <span>Nonce:</span>
            <div>
              <input ref={nonceRef} type="text" defaultValue={nonce} onChange={(e) => implVM.setNonce(e.target.value)} />
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
          <button className="positive" disabled={!implVM.isValid || implVM.insufficientFee} onClick={(_) => onContinue?.()}>
            {implVM.insufficientFee ? 'Insufficient Fee' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }
);
