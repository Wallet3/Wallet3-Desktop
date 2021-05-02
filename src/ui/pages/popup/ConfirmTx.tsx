import './ConfirmTx.css';

import { ApplicationPopup } from '../../viewmodels/ApplicationPopup';
import { CreateSendTx } from '../../../common/Messages';
import { GasnowWs } from '../../../api/Gasnow';
import { PopupTitle } from '../../components';
import React from 'react';
import { SendTxVM } from '../../viewmodels/SendTxVM';
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

const TransferView = ({ implVM }: { implVM: SendTxVM }) => {
  const { args } = implVM;

  const amount = utils.formatUnits(args.value || args.token.amount, args.token.decimals);
  const maxFee = utils.formatEther(args.gasPrice * args.gas);
  return (
    <div className="details">
      <div className="form">
        <div>
          <span>Receipt:</span>
          <span title={args.receipt?.address ?? args.to}>{args.receipt?.name ?? args.receipt?.address ?? args.to}</span>
        </div>

        <div>
          <span>Amount:</span>
          <span>
            {amount} {args.token.symbol}
          </span>
        </div>

        <div>
          <span>Gas Limit:</span>
          <span>{args.gas}</span>
        </div>

        <div>
          <span>Gas Price:</span>
          <span>{args.gasPrice / GasnowWs.gwei_1} Gwei</span>
        </div>

        <div>
          <span>Max Fee:</span>
          <span>{maxFee} ETH</span>
        </div>
      </div>

      <div className="actions">
        <button onClick={(_) => Window.close()}>Cancel</button>
        <button>Continue</button>
      </div>
    </div>
  );
};
