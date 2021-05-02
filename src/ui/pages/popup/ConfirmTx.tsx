import './ConfirmTx.css';

import { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import { ConfirmVM } from '../../viewmodels/ConfirmVM';
import { CreateSendTx } from '../../../common/Messages';
import { GasnowWs } from '../../../api/Gasnow';
import Icons from '../../misc/Icons';
import { PopupTitle } from '../../components';
import React from 'react';
import Window from '../../ipc/Window';
import { formatNum } from '../../misc/Formatter';
import { observer } from 'mobx-react-lite';
import { utils } from 'ethers';

interface Props {
  app: ApplicationPopup;
}

export default observer(({ app }: Props) => {
  return (
    <div className="page tx">
      <PopupTitle title="Transfer" icon="repeat" />
      <TransferView implVM={app.implVM} />
    </div>
  );
});

const TransferView = observer(({ implVM }: { implVM: ConfirmVM }) => {
  const { receiptAddress, receipt, amount, tokenSymbol, gas, gasPrice, maxFee, nonce } = implVM;

  return (
    <div className="details">
      <div className="form">
        <div>
          <span>Receipt:</span>
          <span title={receiptAddress}>{receipt}</span>
        </div>

        <div>
          <span>Amount:</span>
          <span>
            {amount} <img src={Icons(tokenSymbol)} alt={tokenSymbol} /> {tokenSymbol}
          </span>
        </div>

        <div>
          <span>Gas Limit:</span>
          <input type="text" defaultValue={gas} onChange={(e) => implVM.setGas(e.target.value)} />
        </div>

        <div>
          <span>Gas Price:</span>
          <div>
            <input type="text" defaultValue={gasPrice} onChange={(e) => implVM.setGasPrice(e.target.value)} />
            <span>Gwei</span>
          </div>
        </div>

        <div>
          <span>Nonce:</span>
          <input type="text" defaultValue={nonce} onChange={(e) => implVM.setNonce(e.target.value)} />
        </div>

        <div>
          <span>Max Fee:</span>
          <span>{maxFee} ETH</span>
        </div>
      </div>

      <div className="actions">
        <button onClick={(_) => Window.close()}>Cancel</button>
        <button disabled={!implVM.isValid || implVM.insufficientFee}>Continue</button>
      </div>
    </div>
  );
});
