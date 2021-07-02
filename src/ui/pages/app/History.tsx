import './History.css';
import 'react-virtualized/styles.css';

import { BigNumber, utils } from 'ethers';

import { Application } from '../../viewmodels/Application';
import { List } from 'react-virtualized';
import { NavBar } from '../../components';
import { NetworkIcons } from '../../../ui/misc/Icons';
import { Networks } from '../../../misc/Networks';
import React from 'react';
import Tokens from '../../../misc/Tokens';
import { WalletVM } from '../../viewmodels/WalletVM';
import { formatAddress } from '../../misc/Formatter';
import { observer } from 'mobx-react-lite';
import { parseMethod } from '../../../common/TxParser';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default observer(({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const { t } = useTranslation();
  const { historyTxsVM: vm, currentAccount } = walletVM;
  const userTokens = currentAccount.loadTokenConfigs();

  useEffect(() => {
    vm.fetchTxs();
  }, []);

  const rowRenderer = ({ index, key, style }: { index: number; key: any; style: any }) => {
    const tx = vm.txs[index];

    const network = Networks.find((n) => n.chainId === tx.chainId);
    const { method, to, amount, from } = parseMethod(tx, {
      owner: currentAccount.address,
      nativeSymbol: network.symbol,
    });

    const confirmed = tx.blockNumber > 0;
    const failed = tx.status === false && confirmed;
    const status = failed ? 'failed' : confirmed ? 'confirmed' : 'pending';
    const timestamp = new Date(tx.timestamp);
    const networkIcon = NetworkIcons(network.network);
    let value = utils.formatEther(Number.parseInt(tx.value) === 0 ? 0 : tx.value);
    let tokenSymbol = network.symbol;

    if (method.startsWith('Transfer')) {
      const token =
        Tokens.find((t) => t.address.toLowerCase() === tx.to.toLowerCase()) ||
        userTokens.find((t) => t.id.toLowerCase() === tx.to.toLowerCase());

      if (token) {
        value = utils.formatUnits(amount, token.decimals);
        tokenSymbol = token.symbol;
      }
    }

    const txFromTo = from ? 'From' : 'To';
    const txFromToAddr = from || to || tx.to;

    const onClick = () => {
      vm.selectTx(tx);
      app.history.push('/tx');
    };

    return (
      <div className="tx" key={tx.hash || key} style={style} onClick={(_) => onClick()}>
        <img src={networkIcon} />

        <div className="info">
          <div>
            <span className="method">{t(method)}</span>
            <div title={`${value} ${tokenSymbol}`}>
              <span style={{ maxWidth: '32vw' }}>{value}</span> <span>{tokenSymbol}</span>
            </div>
          </div>
          <div>
            <span>
              {`${timestamp.getMonth() + 1}/${timestamp.getDate()} ${txFromTo}: ${formatAddress(txFromToAddr, 6, 4)}`}
            </span>
            <span className={`${status} status`}>{t(status)}</span>
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
