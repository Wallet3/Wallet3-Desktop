import './UtilityBar.css';

import { Image, NetworkMenu } from '../../../components';
import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu';
import { NetworksVM, PublicNetworks, Testnets } from '../../../viewmodels/NetworksVM';

import { Application } from '../../../viewmodels/Application';
import ConnectedDAppLabel from './ConnectedDAppLabel';
import Feather from 'feather-icons-react';
import GasStation from '../../../../gas';
import PendingTx from './PendingTxLabel';
import PendingTxIndicator from './PendingTxIndicator';
import React from 'react';
import WalletConnectIndicator from './WalletConnectIndicator';
import { WalletVM } from '../../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface Props {
  app: Application;
  walletVM: WalletVM;
  networksVM: NetworksVM;
}

const MenuItemStyle = {
  padding: '8px 12px',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  lineHeight: '12px',
};

export default observer(({ app, walletVM, networksVM }: Props) => {
  const { t } = useTranslation();
  const { currentAccount: accountVM, pendingTxCount, pendingTxs, connectedDApps, appCount } = walletVM;

  return (
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
          {pendingTxs.slice(0, 10).map((item) => {
            return (
              <MenuItem
                key={item.hash}
                styles={{ padding: '8px 12px' }}
                onClick={(_) => {
                  walletVM.selectPendingTx(item);
                  app.history.push(`/pendingtx?hash=${item.hash}`);
                }}
              >
                <PendingTx
                  tx={item}
                  rapid={GasStation.getGasPrice(item.chainId, 'rapid')}
                  fast={GasStation.getGasPrice(item.chainId, 'fast')}
                  standard={GasStation.getGasPrice(item.chainId, 'standard')}
                />
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
            <MenuItem styles={MenuItemStyle} onClick={(_) => app.history.push('/connectedapps')}>
              <span>{`${t('See All')} (${appCount})`}</span>
            </MenuItem>
          ) : undefined}
        </Menu>
      ) : undefined}

      <NetworkMenu
        currentChainId={networksVM.currentChainId}
        publicNetworks={PublicNetworks}
        testnets={Testnets}
        onNetworkSelected={(id) => networksVM.setCurrentChainId(id)}
        position="anchor"
      />

      <Menu
        direction="bottom"
        styles={{ minWidth: '5.5rem' }}
        menuButton={() => (
          <MenuButton
            className="icon-button"
            title={`${accountVM?.ens || accountVM?.address} (Account ${accountVM.accountIndex})` ?? 'Show Address'}
          >
            <Feather icon="user" size={16} strokeWidth={1} />
          </MenuButton>
        )}
      >
        <MenuItem styles={MenuItemStyle} onClick={(_) => app.history.push('/account')}>
          <div className="profile-item">
            <Feather icon="share-2" size={13} />
            <span>{t('Profile')}</span>
          </div>
        </MenuItem>
        <MenuItem styles={MenuItemStyle}>
          <div className="profile-item">
            <Feather icon="database" size={13} />
            <span>{t('History')}</span>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
});
