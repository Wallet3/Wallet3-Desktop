import './Wallet.css';
import '@szhsin/react-menu/dist/index.css';

import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu';
import { Networks, NetworksVM } from '../../viewmodels/NetworksVM';
import React, { useState } from 'react';

import { AccountVM } from '../../viewmodels/AccountVM';
import AnimatedNumber from 'react-animated-number';
import Feather from 'feather-icons-react';
import HSBar from 'react-horizontal-stacked-bar-chart';
import { ITokenBalance } from '../../../api/Debank';
import { Line } from 'rc-progress';
import NetworkLabel from '../../components/NetworkLabel';
import Skeleton from 'react-loading-skeleton';
import findIcon from '../../misc/Icons';
import { formatNum } from '../../misc/Formatter';
import { observer } from 'mobx-react-lite';

const menuItemStyle = {
  padding: '8px 12px',
};

export default observer(({ networksVM, accountVM }: { networksVM: NetworksVM; accountVM?: AccountVM }) => {
  const rows = accountVM.tokens.length / 2;
  const rowTokens: ITokenBalance[][] = [];

  for (let i = 0; i < rows; i++) {
    const row: ITokenBalance[] = [];
    for (let j = 0; j < 2; j++) {
      const token = accountVM.tokens[i * 2 + j];
      if (token) row.push(token);
    }

    rowTokens.push(row);
  }

  return (
    <div className="page main">
      <div className="utility-bar">
        <div></div>

        <Menu
          menuButton={() => (
            <MenuButton className="menu-button">
              <NetworkLabel chainId={networksVM.currentChainId} />
            </MenuButton>
          )}
          direction="bottom"
          overflow="auto"
          position="anchor"
          arrow
        >
          {Networks.map((item) => {
            return (
              <MenuItem
                key={item.chainId}
                styles={menuItemStyle}
                onClick={(_) => networksVM.setCurrentChainId(item.chainId)}
              >
                <NetworkLabel expand chainId={item.chainId} />
              </MenuItem>
            );
          })}
        </Menu>

        <button className="icon-button" title={accountVM?.address ?? 'Show Address'} onClick={(_) => console.log('click')}>
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
          {accountVM?.chains.length > 0 ? (
            <HSBar height={3} showTextWithValue={false} showTextDown outlineWidth={0} data={accountVM?.chains} />
          ) : (
            <Skeleton />
          )}
        </div>
      </div>

      <div className="wallet-actions">
        <button>
          <Feather icon="camera" size={14} strokeWidth={2} />
          <span>Connect</span>
        </button>
        <button>
          <Feather icon="send" size={14} strokeWidth={2} />
          <span>Send</span>
        </button>
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
                        <button>
                          <div>
                            <img className="token-icon" src={findIcon(token.symbol)} alt="" />
                            <span className="symbol">{token.symbol}</span>
                            <span></span>
                            <span className="amount">{formatNum(token.amount, '')}</span>
                          </div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* <tr>
              <td>
                <button>
                  <div>
                    <img src={ETH} alt="" />
                    <span>ETH</span>
                    <span></span>
                    <span>1.001</span>
                  </div>
                </button>
              </td>
              <td>
                <button>
                  <div>
                    <img src={USDC} alt="" />
                    <span>USDC</span>
                    <span></span>
                    <span>1,234,567.89</span>
                  </div>
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button>
                  <div>
                    <img src={DAI} alt="" />
                    <span>DAI</span>
                    <span></span>
                    <span>123.001</span>
                  </div>
                </button>
              </td>
              <td>
                <div></div>
              </td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </div>
  );
});
