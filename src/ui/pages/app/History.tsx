import './History.css';
import 'react-virtualized/styles.css';

import { Application } from '../../viewmodels/Application';
import { List } from 'react-virtualized';
import { NavBar } from '../../components';
import { Networks } from '../../viewmodels/NetworksVM';
import React from 'react';
import { WalletVM } from '../../viewmodels/WalletVM';
import { formatAddress } from '../../misc/Formatter';
import { observer } from 'mobx-react-lite';
import { parseMethod } from '../../../common/TxParser';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { utils } from 'ethers';

export default observer(({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const { t } = useTranslation();
  const { historyTxsVM: vm } = walletVM;

  useEffect(() => {
    vm.fetchTxs();
  }, []);

  const rowRenderer = ({ index, key, style }: { index: number; key: any; style: any }) => {
    const tx = vm.txs[index];

    const network = Networks.find((n) => n.chainId === tx.chainId);
    const { method, to } = parseMethod(tx);
    const value = utils.formatEther(tx.value);
    const confirmed = tx.blockNumber > 0;

    return (
      <div className="tx" key={tx.hash || key} style={style}>
        <div>
          <span className="method">{method}</span>
          <span>{`${value} ${network.symbol}`}</span>
        </div>
        <div>
          <div>{`To: ${formatAddress(to || vm.txs[index].to, 8, 5)}`}</div>
          <div className={confirmed ? 'confirmed' : 'pending'}>{confirmed ? 'Confirmed' : 'Pending'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="page history">
      <NavBar title={t('History')} onBackClick={() => app.history.goBack()} />

      <div className="content">
        <List
          height={window.innerHeight - 24 - 48}
          rowCount={vm?.txs.length ?? 0}
          rowHeight={64}
          width={window.innerWidth - 24}
          rowRenderer={rowRenderer}
        />
      </div>
    </div>
  );
});
