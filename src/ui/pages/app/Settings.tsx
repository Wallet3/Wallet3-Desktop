import './Settings.css';

import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu';

import { Application } from '../../viewmodels/Application';
import { CurrencyVM } from '../../viewmodels/settings/CurrencyVM';
import DisplayCurrency from './components/DisplayCurrency';
import Feather from 'feather-icons-react';
import { LangsVM } from '../../viewmodels/settings/LangsVM';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import React from 'react';
import Select from 'react-select';
import { WalletVM } from '../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface IConstructor {
  app: Application;
  walletVM: WalletVM;
  currencyVM: CurrencyVM;
  langsVM: LangsVM;
}

export default observer(({ walletVM, app, currencyVM, langsVM }: IConstructor) => {
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

    app.history.push(`/backupMnemonic/${authKey}`);
  };

  const goToChangePasscode = async () => {
    const { success, authKey } = await app.auth();
    if (!success) return;

    app.history.push(`/setupPassword/${authKey}`);
  };

  const goToReset = async () => {
    const { success, authKey } = await app.auth();
    if (!success) return;

    app.history.push(`/reset/${authKey}`);
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
          defaultValue={accounts.find((a) => a.value.address === walletVM.currentAccount.address)}
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
              <MenuItem key={c.flag} styles={{ padding: '8px 12px' }} onClick={() => currencyVM.setCurrency(c)}>
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
              <DisplayCurrency flag={langsVM.currentLang.flag} label={langsVM.currentLang.name} />
            </MenuButton>
          )}
        >
          {langsVM.supportedLangs.map((lang) => {
            return (
              <MenuItem key={lang.value} styles={{ padding: '8px 12px' }} onClick={(_) => langsVM.setLang(lang)}>
                <DisplayCurrency flag={lang.flag} label={lang.name} mini />
              </MenuItem>
            );
          })}
        </Menu>
      </div>

      <div className="setting-item click" onClick={(_) => goToBackupMnemonic()}>
        <Feather icon="package" size={iconSize} />
        <span>{t('Backup Secret')}</span>
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

      <div className="setting-item click" onClick={(_) => app.history.push(`/about`)}>
        <Feather icon="book" size={iconSize} />
        <span>{t('About')}</span>
        <Feather icon="chevron-right" size={15} />
      </div>
    </div>
  );
});
