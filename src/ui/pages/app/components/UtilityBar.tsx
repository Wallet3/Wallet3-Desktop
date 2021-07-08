import './UtilityBar.css';

import { Image, NetworkMenu } from '../../../components';
import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu';
import { PublicNetworks, Testnets } from '../../../../misc/Networks';

import { Application } from '../../../viewmodels/Application';
import ConnectedAppsIndicator from './ConnectedAppsIndicator';
import ConnectedDAppLabel from './ConnectedDAppLabel';
import Feather from 'feather-icons-react';
import GasStation from '../../../../gas';
import { NetworksVM } from '../../../viewmodels/NetworksVM';
import PendingTx from './PendingTxLabel';
import PendingTxIndicator from './PendingTxIndicator';
import React from 'react';
import Shell from '../../../bridges/Shell';
import WalletConnectIndicator from './WalletConnectIndicator';
import { convertToAccountUrl } from '../../../../misc/Url';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface Props {
  app: Application;
  networksVM: NetworksVM;
}

const MenuItemStyle = {
  padding: '0px',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  lineHeight: '12px',
};

export default observer(({ app, networksVM }: Props) => {
  const { t } = useTranslation();
  const { wallets, currentWallet } = app;
  const { currentAccount, pendingTxCount, pendingTxs, connectedDApps, appCount } = currentWallet;

  return (
    <div className="utility-bar">
      <button
        className="menu-button walletconnect"
        title={app.connectingApp ? t('DApp Connecting') : t('Manually Connect DApps')}
        onClick={async (_) =>
          app.connectingApp
            ? undefined
            : (await app.connectWallet())
            ? undefined
            : app.ask({ title: t('Manually Connect DApps'), icon: 'activity', message: t('Use WalletConnect') })
        }
      >
        <WalletConnectIndicator connecting={app.connectingApp} />
      </button>

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
              <MenuItem key={item.hash} styles={{ padding: 0 }}>
                <button
                  onClick={(_) => {
                    currentWallet.selectPendingTx(item);
                    app.history.push(`/tx?hash=${item.hash}`);
                  }}
                >
                  <PendingTx
                    tx={item}
                    rapid={GasStation.getGasPrice(item.chainId, 'rapid')}
                    fast={GasStation.getGasPrice(item.chainId, 'fast')}
                    standard={GasStation.getGasPrice(item.chainId, 'standard')}
                  />
                </button>
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
              <ConnectedAppsIndicator count={appCount} />
            </MenuButton>
          )}
        >
          {connectedDApps.slice(0, 6).map((s) => {
            return (
              <MenuItem key={s.key} styles={{ padding: '0' }}>
                <button
                  style={{ padding: '10px' }}
                  onClick={(_) => {
                    currentWallet.selectDAppSession(s);
                    app.history.push(`/connectedapp`);
                  }}
                >
                  <ConnectedDAppLabel {...s} />
                </button>
              </MenuItem>
            );
          })}

          {appCount > 6 ? <MenuDivider /> : undefined}
          {appCount > 6 ? (
            <MenuItem styles={MenuItemStyle}>
              <button onClick={(_) => app.history.push('/connectedapps')}>
                <span>{`${t('See All')} (${appCount})`}</span>
              </button>
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
            onDoubleClick={(_) => Shell.open(convertToAccountUrl(networksVM.currentChainId, currentAccount?.address))}
            className="icon-button"
            title={`${currentAccount?.ens || currentAccount?.address} (${
              currentAccount?.name || `Account ${currentAccount?.accountIndex}`
            })`}
          >
            <Feather icon="user" size={16} strokeWidth={1} />
          </MenuButton>
        )}
      >
        <MenuItem styles={MenuItemStyle}>
          <button onClick={(_) => app.history.push('/account')}>
            <div className="profile-item">
              <Feather icon="share-2" size={13} />
              <span>{t('Profile')}</span>
            </div>
          </button>
        </MenuItem>
        <MenuItem styles={MenuItemStyle}>
          <button onClick={(_) => app.history.push('/history')}>
            <div className="profile-item">
              <Feather icon="database" size={13} />
              <span>{t('History')}</span>
            </div>
          </button>
        </MenuItem>

        <MenuDivider />

        {wallets.map((k) => {
          return (
            <MenuItem styles={MenuItemStyle} key={k.id}>
              <button onClick={(_) => app.switchWallet(k.id)}>
                <div className={`${currentWallet.id === k.id ? 'active' : ''} profile-item`}>
                  <Feather icon={'credit-card'} size={13} />
                  <span>{k.name}</span>
                </div>
              </button>
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
});
