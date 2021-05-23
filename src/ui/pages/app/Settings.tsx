import './Settings.css';

import { CryptoIcons, FlagIcons } from '../../misc/Icons';
import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu';

import { Application } from '../../viewmodels/Application';
import DisplayCurrency from './components/DisplayCurrency';
import Feather from 'feather-icons-react';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import React from 'react';
import Select from 'react-select';
import { WalletVM } from '../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';

const tokens = [
  { value: 'usd', label: 'USD' },
  { value: 'eth', label: 'ETH' },
];

const langs = [
  { value: 'usa', label: 'English' },
  { value: 'jp', label: '日本語' },
  { value: 'cn', label: '简体中文' },
];

const icon = (symbol: string) => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundImage: `url(${FlagIcons(symbol)})`,
    backgroundSize: 'cover',
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 19,
    width: 19,
  },
});

const customStyles = {
  option: (provided, state) => {
    console.log(state);
    return {
      ...provided,
      ...icon(state.value),
    };
  },
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';
    return { ...provided, opacity, transition, ...icon(state.data.value) };
  },
};

export default observer(({ walletVM, app }: { app: Application; walletVM: WalletVM; networksVM: NetworksVM }) => {
  const accounts = walletVM.accounts.map((a, i) => {
    const addr = `${a.address.substring(0, 7)}...${a.address.substring(a.address.length - 4)}`;
    const balance = a.nativeToken ? `(${a.nativeToken.amount.toFixed(2)} ${a.nativeToken.symbol})` : '';
    const name = a.name || (a.ens ? a.ens.substring(0, a.ens.indexOf('.eth')).substring(0, 12) : `Account ${i + 1}`);
    return {
      label: `${name} | ${addr} ${balance}`,
      value: a,
    };
  });

  const iconSize = 15;
  return (
    <div className="page settings">
      <div className="drop-menu accounts">
        <div className="actions">
          <span className="title">Accounts</span>
        </div>
        <Select
          options={accounts}
          isClearable={false}
          isSearchable={false}
          defaultValue={accounts.find((a) => a.value === walletVM.currentAccount)}
          onChange={(v) => walletVM.selectAccount(v.value)}
        />
      </div>

      <div className="setting-item">
        <Feather icon="dollar-sign" size={iconSize} />
        <span>Display Currency</span>
        <Menu
          styles={{ minWidth: '3rem' }}
          menuButton={() => (
            <MenuButton className="menu-button">
              <DisplayCurrency flag="USD" />
            </MenuButton>
          )}
        >
          <MenuItem styles={{ padding: '8px 12px' }}>
            <DisplayCurrency flag="USD" mini />
          </MenuItem>
        </Menu>
      </div>

      <div className="setting-item">
        <Feather icon="globe" size={iconSize} />
        <span>Languages</span>

        <Menu
          styles={{ minWidth: '5rem' }}
          menuButton={() => (
            <MenuButton className="menu-button">
              <DisplayCurrency flag="usa" label="English" />
            </MenuButton>
          )}
        >
          <MenuItem styles={{ padding: '8px 12px' }}>
            <DisplayCurrency flag="usa" label="English" mini />
          </MenuItem>
          <MenuItem styles={{ padding: '8px 12px' }}>
            <DisplayCurrency flag="jp" label="日本語" mini />
          </MenuItem>
        </Menu>
      </div>

      <div className="setting-item click" onClick={(_) => app.auth()}>
        <Feather icon="package" size={iconSize} />
        <span>Backup Mnemonic</span>
        <Feather icon="chevron-right" size={15} />
      </div>

      <div className="setting-item click" onClick={(_) => app.auth()}>
        <Feather icon="lock" size={iconSize} />
        <span>Change Passcode</span>
        <Feather icon="chevron-right" size={15} />
      </div>

      <div className="setting-item click" onClick={(_) => app.auth()}>
        <Feather icon="tool" size={iconSize} />
        <span>Reset</span>
        <Feather icon="chevron-right" size={15} />
      </div>
    </div>
  );
});
