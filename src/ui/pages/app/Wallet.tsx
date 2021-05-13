import './Wallet.css';
import '@szhsin/react-menu/dist/index.css';

import { Link, useRouteMatch } from 'react-router-dom';
import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu';
import { Networks, NetworksVM } from '../../viewmodels/NetworksVM';
import React, { useEffect, useState } from 'react';

import { AccountVM } from '../../viewmodels/AccountVM';
import AnimatedNumber from 'react-animated-number';
import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import HSBar from 'react-horizontal-stacked-bar-chart';
import { ITokenBalance } from '../../../api/Debank';
import NetworkLabel from './components/NetworkLabel';
import PendingTxIndicator from './components/PendingTxIndicator';
import Skeleton from 'react-loading-skeleton';
import findIcon from '../../misc/Icons';
import { formatNum } from '../../misc/Formatter';
import { observer } from 'mobx-react-lite';

export default observer(
  ({ networksVM, accountVM, app }: { app: Application; networksVM: NetworksVM; accountVM?: AccountVM }) => {
    const rows = accountVM.chainTokens.length / 2;
    const rowTokens: ITokenBalance[][] = [];

    for (let i = 0; i < rows && i < 7; i++) {
      const row: ITokenBalance[] = [];
      for (let j = 0; j < 2; j++) {
        const token = accountVM.chainTokens[i * 2 + j];
        row.push(token);
      }
      rowTokens.push(row);
    }

    return (
      <div className="page main">
        <div className="utility-bar">
          <Menu
            menuButton={() => (
              <MenuButton className="menu-button">
                <PendingTxIndicator pendingCount={1} />
              </MenuButton>
            )}
            direction="bottom"
            overflow="auto"
            position="anchor"
            arrow
          ></Menu>

          <Menu
            menuButton={() => (
              <MenuButton className="menu-button">
                <NetworkLabel chainId={networksVM.currentChainId} />
              </MenuButton>
            )}
            styles={{ minWidth: '7rem' }}
            direction="bottom"
            overflow="auto"
            position="anchor"
            arrow
          >
            {Networks.map((item) => {
              return item ? (
                <MenuItem
                  key={item.chainId}
                  styles={{ padding: '8px 12px' }}
                  onClick={(_) => networksVM.setCurrentChainId(item.chainId)}
                >
                  <NetworkLabel expand chainId={item.chainId} />
                </MenuItem>
              ) : (
                <MenuDivider key={Math.random()} />
              );
            })}
          </Menu>

          <button
            className="icon-button"
            title={accountVM?.address ?? 'Show Address'}
            onClick={(_) => app.history.push('/account')}
          >
            <Feather icon="user" size={18} strokeWidth={1} />
          </button>
        </div>

        <div className="net-worth">
          <h3 className="title">Net Worth</h3>
          <div className="value">
            {accountVM.netWorth === undefined ? (
              <Skeleton />
            ) : (
              <AnimatedNumber component="span" value={accountVM.netWorth} duration={300} formatValue={(n) => formatNum(n)} />
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
            <span>Connect</span>
          </button>
          <Link className="button" to="/send">
            <Feather icon="send" size={14} strokeWidth={2} />
            <span>Send</span>
          </Link>
        </div>

        <div className="assets">
          <h3 className="title">Assets</h3>

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
                              title={`${token.display_symbol || token.symbol}: $${token.amount * token.price}`}
                            >
                              <div>
                                <img className="token-icon" src={findIcon(token.display_symbol || token.symbol)} alt="" />
                                <span className="symbol">{token.display_symbol || token.symbol}</span>
                                <span></span>
                                <span className="amount">{formatNum(token.amount, '')}</span>
                              </div>
                            </Link>
                          ) : undefined}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);
