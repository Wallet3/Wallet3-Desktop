import './History.css';
import 'react-virtualized/styles.css';

import { Application } from '../../viewmodels/Application';
import { List } from 'react-virtualized';
import { NavBar } from '../../components';
import { NetworkIcons } from '../../../ui/misc/Icons';
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
  const { historyTxsVM: vm, currentAccount } = walletVM;

  useEffect(() => {
    vm.fetchTxs();
  }, []);

  const rowRenderer = ({ index, key, style }: { index: number; key: any; style: any }) => {
    const tx = vm.txs[index];

    const network = Networks.find((n) => n.chainId === tx.chainId);
    const { method, to } = parseMethod(tx, {
      owner: currentAccount.address,
      nativeSymbol: network.symbol,
    });

    const value = utils.formatEther(tx.value);
    const confirmed = tx.blockNumber > 0;
    const failed = tx.status === false && confirmed;
    const status = failed ? 'failed' : confirmed ? 'confirmed' : 'pending';
    const timestamp = new Date(tx.timestamp);
    const networkIcon = NetworkIcons(network.network);

    return (
      <div className="tx" key={tx.hash || key} style={style}>
        <img src={networkIcon} />

        <div className="info">
          <div>
            <span className="method">{method}</span>
            <span title={`${value} ${network.symbol}`}>{`${value} ${network.symbol}`}</span>
          </div>
          <div>
            <span>
              {`${timestamp.getMonth() + 1}/${timestamp.getDate()} To: ${formatAddress(to || vm.txs[index].to, 6, 4)}`}
            </span>
            <span className={`${status} status`}>{status}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page history">
      <NavBar title={t('History')} onBackClick={() => app.history.goBack()} />

      <div className="content">
        <List
          height={window.innerHeight - 12 - 48}
          rowCount={vm?.txs.length ?? 0}
          rowHeight={48}
          width={window.innerWidth}
          rowRenderer={rowRenderer}
        />
      </div>
    </div>
  );
});
