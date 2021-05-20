import './PendingTxLabel.css';

import BarLoader from 'react-spinners/BarLoader';
import Feather from 'feather-icons-react';
import { Networks } from '../../../viewmodels/NetworksVM';
import React from 'react';
import { TxParams } from '../../../../common/Messages';
import { observer } from 'mobx-react-lite';
import { utils } from 'ethers';

export default observer(({ tx, rapid, fast, standard }: { tx: TxParams; rapid: number; fast: number; standard: number }) => {
  const level =
    tx.gasPrice >= rapid ? 'rapid' : tx.gasPrice >= fast ? 'fast' : tx.gasPrice >= standard ? 'standard' : 'slow';

  return (
    <div className="pendingtx-label">
      <div className="title">
        <div>
          <span className={`${level} gas`}>{level}</span>
          <span>{tx.hash}</span>
        </div>
        <BarLoader width={20} height={2} />
      </div>

      <div className="extra">
        <span>{new Date(tx.timestamp).toLocaleString()}</span>
        <span>
          {`${utils.formatEther(tx.value).substring(0, 5)} ${
            Networks.find((n) => n?.chainId === tx.chainId)?.symbol || 'ETH'
          }`}
        </span>
      </div>
    </div>
  );
});
