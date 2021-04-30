import './Wallet.css';
import '@szhsin/react-menu/dist/index.css';

import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu';
import { Networks, NetworksVM } from '../../viewmodels/NetworksVM';
import React, { useState } from 'react';

import { AccountVM } from '../../viewmodels/AccountVM';
import DAI from '../../../assets/icons/crypto/dai.svg';
import ETH from '../../../assets/icons/crypto/eth.svg';
import Feather from 'feather-icons-react';
import HSBar from 'react-horizontal-stacked-bar-chart';
import { Line } from 'rc-progress';
import NetworkLabel from '../../components/NetworkLabel';
import Skeleton from 'react-loading-skeleton';
import USDC from '../../../assets/icons/crypto/usdc.svg';
import { observer } from 'mobx-react-lite';

const menuItemStyle = {
  padding: '8px 12px',
};

export default observer(({ networksVM, accountVM }: { networksVM: NetworksVM; accountVM?: AccountVM }) => {
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
        <div className="value">{accountVM.balance ? '$ 2,729,185.22' : <Skeleton />}</div>

        <div className="asset-percent">
          {accountVM?.chains.length > 0 ? (
            <HSBar height={2} showTextWithValue={false} showTextDown outlineWidth={0} data={accountVM?.chains} />
          ) : (
            <Skeleton />
          )}
        </div>
      </div>

      <div className="wallet-actions">
        <button>
          <Feather icon="camera" size={14} strokeWidth={2} />
          <span>Scan</span>
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
            <tr>
              <td>
                <div>
                  <img src={ETH} alt="" />
                  <span>ETH</span>
                  <span></span>
                  <span>1.001</span>
                </div>
              </td>
              <td>
                <div>
                  <img src={USDC} alt="" />
                  <span>USDC</span>
                  <span></span>
                  <span>1,234,567.89</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div>
                  <img src={DAI} alt="" />
                  <span>DAI</span>
                  <span></span>
                  <span>123.001</span>
                </div>
              </td>
              <td>
                <div></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});
