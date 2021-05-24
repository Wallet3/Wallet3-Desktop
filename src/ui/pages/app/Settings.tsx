import './Settings.css';

import { CryptoIcons, FlagIcons } from '../../misc/Icons';
import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu';

import { Application } from '../../viewmodels/Application';
import { CurrencyVM } from '../../viewmodels/CurrencyVM';
import DisplayCurrency from './components/DisplayCurrency';
import Feather from 'feather-icons-react';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import React from 'react';
import Select from 'react-select';
import { WalletVM } from '../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

const tokens = [
  { value: 'usd', label: 'USD' },
  { value: 'eth', label: 'ETH' },
];

const langs = [
  { value: 'usa', label: 'English' },
  { value: 'jp', label: '日本語' },
  { value: 'cn', label: '简体中文' },
];

interface IConstructor {
  app: Application;
  walletVM: WalletVM;
  currencyVM: CurrencyVM;
}

export default observer(({ walletVM, app, currencyVM }: IConstructor) => {
  const { t } = useTranslation();

  const accounts = walletVM.accounts.map((a, i) => {
    const addr = `${a.address.substring(0, 7)}...${a.address.substring(a.address.length - 4)}`;
    const balance = a.nativeToken ? `(${a.nativeToken.amount.toFixed(2)} ${a.nativeToken.symbol})` : '';
    const name = a.name || (a.ens ? a.ens.substring(0, a.ens.indexOf('.eth')).substring(0, 12) : `Account ${i + 1}`);
    return {
      label: `${name} | ${addr} ${balance}`,
      value: a,
    };
  });

  const goToBackupMnemonic = async () => {
    const { success, authKey } = await app.auth();
    if (!success) return;

    app.history.push(`/backupMnemonic?authKey=${authKey}`);
  };

  const goToChangePasscode = async () => {
    const { success, authKey } = await app.auth();
    if (!success) return;

    app.history.push(`/setupPassword?authKey=${authKey}`);
  };

  const goToReset = async () => {
    const { success, authKey } = await app.auth();
    if (!success) return;

    app.history.push(`/reset?authKey=${authKey}`);
  };

  const iconSize = 15;
  return (
    <div className="page settings">
      <div className="drop-menu accounts">
        <div className="actions">
          <span className="title">{t('Accounts')}</span>
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
        <span>{t('Display Currency')}</span>
        <Menu
          styles={{ minWidth: '3rem' }}
          menuButton={() => (
            <MenuButton className="menu-button">
              <DisplayCurrency flag={currencyVM.currentCurrency.flag} label={currencyVM.currentCurrency.currency} />
            </MenuButton>
          )}
        >
          {currencyVM.supportedCurrencies.map((c) => {
            return (
              <MenuItem styles={{ padding: '8px 12px' }} onClick={() => currencyVM.setCurrency(c)}>
                <DisplayCurrency flag={c.flag} label={c.currency} mini />
              </MenuItem>
            );
          })}
        </Menu>
      </div>

      <div className="setting-item">
        <Feather icon="globe" size={iconSize} />
        <span>{t('Languages')}</span>

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

      <div className="setting-item click" onClick={(_) => goToBackupMnemonic()}>
        <Feather icon="package" size={iconSize} />
        <span>{t('Backup Mnemonic')}</span>
        <Feather icon="chevron-right" size={15} />
      </div>

      <div className="setting-item click" onClick={(_) => goToChangePasscode()}>
        <Feather icon="lock" size={iconSize} />
        <span>{t('Change Passcode')}</span>
        <Feather icon="chevron-right" size={15} />
      </div>

      <div className="setting-item click" onClick={(_) => goToReset()}>
        <Feather icon="tool" size={iconSize} />
        <span>{t('Reset')}</span>
        <Feather icon="chevron-right" size={15} />
      </div>
    </div>
  );
});
