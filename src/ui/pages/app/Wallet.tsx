import './Wallet.css';
import '@szhsin/react-menu/dist/index.css';

import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu';
import { NetworksVM, PublicNetworks, Testnets } from '../../viewmodels/NetworksVM';
import React, { useEffect } from 'react';

import AnimatedNumber from 'react-animated-number';
import { Application } from '../../viewmodels/Application';
import ConnectedDAppLabel from './components/ConnectedDAppLabel';
import { CryptoIcons } from '../../misc/Icons';
import { CurrencyVM } from '../../viewmodels/CurrencyVM';
import Feather from 'feather-icons-react';
import GasnowWs from '../../../gas/Gasnow';
import HSBar from 'react-horizontal-stacked-bar-chart';
import { Link } from 'react-router-dom';
import NetworkLabel from './components/NetworkLabel';
import PendingTx from './components/PendingTxLabel';
import PendingTxIndicator from './components/PendingTxIndicator';
import Skeleton from 'react-loading-skeleton';
import { UserToken } from '../../../ui/viewmodels/models/UserToken';
import WalletConnectIndicator from './components/WalletConnectIndicator';
import { WalletVM } from '../../viewmodels/WalletVM';
import { formatNum } from '../../misc/Formatter';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface IConstructor {
  app: Application;
  networksVM: NetworksVM;
  walletVM: WalletVM;
  currencyVM: CurrencyVM;
}

export default observer(({ networksVM, app, walletVM, currencyVM }: IConstructor) => {
  const { t } = useTranslation();
  const { currentAccount: accountVM, pendingTxCount, pendingTxs, connectedDApps, appCount } = walletVM;

  const maxRows = 6;
  const rows = accountVM.chainTokens.length / 2;
  const rowTokens: UserToken[][] =
    accountVM.chainTokens.length === 0
      ? new Array(maxRows).fill([null, null])
      : new Array(maxRows).fill([undefined, undefined]);

  for (let i = 0; i < rows && i < maxRows; i++) {
    const row: UserToken[] = [];
    for (let j = 0; j < 2; j++) {
      const token = accountVM.chainTokens[i * 2 + j];
      row.push(token);
    }

    rowTokens[i] = row;
  }

  useEffect(() => {
    app.clearHistory();
  }, []);

  return (
    <div className="page main">
      <div className="utility-bar">
        {pendingTxCount > 0 ? (
          <Menu
            menuButton={() => (
              <MenuButton className="menu-button">
                <PendingTxIndicator pendingCount={pendingTxCount} />
              </MenuButton>
            )}
            direction="bottom"
            overflow="auto"
            position="anchor"
          >
            {pendingTxs.map((item) => {
              return (
                <MenuItem
                  key={item.hash}
                  styles={{ padding: '8px 12px' }}
                  onClick={(_) => {
                    walletVM.selectPendingTx(item);
                    app.history.push(`/pendingtx?hash=${item.hash}`);
                  }}
                >
                  <PendingTx tx={item} {...GasnowWs} />
                </MenuItem>
              );
            })}
          </Menu>
        ) : undefined}

        {appCount > 0 ? (
          <Menu
            styles={{ minWidth: '5.5rem' }}
            direction="bottom"
            overflow="auto"
            position="anchor"
            menuButton={() => (
              <MenuButton className="menu-button">
                <WalletConnectIndicator count={appCount} />
              </MenuButton>
            )}
          >
            {connectedDApps.slice(0, 6).map((s) => {
              return (
                <MenuItem
                  key={s.key}
                  styles={{ padding: '8px 12px' }}
                  onClick={(_) => {
                    walletVM.selectDAppSession(s);
                    app.history.push(`/connectedapp`);
                  }}
                >
                  <ConnectedDAppLabel {...s} />
                </MenuItem>
              );
            })}

            {appCount > 6 ? <MenuDivider /> : undefined}
            {appCount > 6 ? (
              <MenuItem
                styles={{ padding: '8px 12px', fontSize: 12, display: 'flex', justifyContent: 'center' }}
                onClick={(_) => app.history.push('/connectedapps')}
              >
                <span>{`${t('See All')} (${appCount})`}</span>
              </MenuItem>
            ) : undefined}
          </Menu>
        ) : undefined}

        <Menu
          menuButton={() => (
            <MenuButton className="menu-button">
              <NetworkLabel chainId={networksVM.currentChainId} />
            </MenuButton>
          )}
          styles={{ minWidth: '5.5rem' }}
          direction="bottom"
          overflow="auto"
          position="anchor"
        >
          {PublicNetworks.map((item) => {
            return (
              <MenuItem
                key={item.chainId}
                styles={{ padding: '8px 12px' }}
                onClick={(_) => networksVM.setCurrentChainId(item.chainId)}
              >
                <NetworkLabel expand chainId={item.chainId} />
              </MenuItem>
            );
          })}
          <MenuDivider />
          {Testnets.map((item) => {
            return (
              <MenuItem
                key={item.chainId}
                styles={{ padding: '8px 12px' }}
                onClick={(_) => networksVM.setCurrentChainId(item.chainId)}
              >
                <NetworkLabel expand chainId={item.chainId} />
              </MenuItem>
            );
          })}
        </Menu>

        <button
          className="icon-button"
          title={`${accountVM?.ens || accountVM?.address} (Account ${accountVM.accountIndex})` ?? 'Show Address'}
          onClick={(_) => app.history.push('/account')}
        >
          <Feather icon="user" size={16} strokeWidth={1} />
        </button>
      </div>

      <div className="net-worth">
        <h3 className="title">{t('Net Worth')}</h3>
        <div className="value">
          {accountVM.netWorth === undefined ? (
            <Skeleton />
          ) : (
            <AnimatedNumber
              component="span"
              value={accountVM.netWorth}
              duration={300}
              formatValue={(n) => currencyVM.format(n)}
            />
          )}
        </div>

        <div className="asset-percent">
          {accountVM?.chainsOverview.length > 0 ? (
            <HSBar height={3} showTextWithValue={false} showTextDown outlineWidth={0} data={accountVM?.chainsOverview} />
          ) : (
            <Skeleton />
          )}
        </div>
      </div>

      <div className="wallet-actions">
        <button onClick={(_) => app.scanQR()}>
          <Feather icon="camera" size={14} strokeWidth={2} />
          <span>{t('Connect')}</span>
        </button>
        <Link className={`button ${accountVM && accountVM.nativeToken ? '' : 'disabled'}`} to="/send">
          <Feather icon="send" size={14} strokeWidth={2} />
          <span>{t('Send')}</span>
        </Link>
      </div>

      <div className="assets">
        <div className="nav-title">
          <h3 className="title">{t('Assets')}</h3>
          <Link to={`/userTokens`}>
            <Feather icon="more-horizontal" size={16} strokeWidth={1} />
          </Link>
        </div>

        <table>
          <tbody>
            {rowTokens.map((row, i) => {
              return (
                <tr key={i}>
                  {row.map((token, j) => {
                    return (
                      <td key={`${i}-${j}`}>
                        {token ? (
                          <Link
                            className="button"
                            to={`/send?token=${token.id}`}
                            title={`${token.symbol}: $${token.amount * token.price || 0}`}
                          >
                            <div>
                              <img className="token-icon" src={CryptoIcons(token.symbol)} alt="" />
                              <span className="symbol">{token.symbol}</span>
                              <span></span>
                              <span className="amount">{formatNum(token.amount, '')}</span>
                            </div>
                          </Link>
                        ) : token === null ? (
                          <Skeleton height={20} />
                        ) : (
                          <span />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="nfts">
        <div className="nav-title">
          <h3 className="title">NFTs</h3>

          <Link to={`/userTokens`}>
            <Feather icon="more-horizontal" size={16} strokeWidth={1} />
          </Link>
        </div>
      </div>
    </div>
  );
});
