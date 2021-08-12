import '@szhsin/react-menu/dist/index.css';
import './NetworkMenu.css';

import { Menu, MenuButton, MenuDivider, MenuItem, MenuPosition, SubMenu } from '@szhsin/react-menu';

import Feather from 'feather-icons-react';
import { History } from 'history';
import { INetwork } from '../../common/Networks';
import NetworkLabel from './NetworkLabel';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

const MenuItemStyles = { padding: 0 };

interface Props {
  showAutoSwitch?: boolean;
  publicNetworks: INetwork[];
  testnets: INetwork[];
  onNetworkSelected: (chainId: number) => void;
  currentChainId: number;
  position?: MenuPosition;
  testnetsCollapsed?: boolean;
  showCustomize?: boolean;
  history?: History;
}

export default observer(
  ({
    publicNetworks,
    testnets,
    currentChainId,
    onNetworkSelected,
    showAutoSwitch,
    position,
    testnetsCollapsed,
    showCustomize,
    history,
  }: Props) => {
    const { t } = useTranslation();

    const Testnets = () =>
      testnets.map((item) => {
        return (
          <MenuItem key={item.chainId} styles={MenuItemStyles}>
            <button onClick={(_) => onNetworkSelected(item.chainId)}>
              <NetworkLabel expand chainId={item.chainId} active={currentChainId === item.chainId} color={item.color} />
            </button>
          </MenuItem>
        );
      });

    return (
      <Menu
        menuButton={() => (
          <MenuButton className="menu-button networks">
            <NetworkLabel chainId={currentChainId} />
          </MenuButton>
        )}
        styles={{ minWidth: '5.5rem' }}
        direction="bottom"
        overflow="auto"
        className="networks-menu"
        position={position || 'auto'}
      >
        {showAutoSwitch ? (
          <MenuItem styles={MenuItemStyles}>
            <button onClick={(_) => onNetworkSelected(0)}>
              <NetworkLabel chainId={0} expand />
            </button>
          </MenuItem>
        ) : undefined}
        {showAutoSwitch ? <MenuDivider /> : undefined}

        {publicNetworks.map((item) => {
          return (
            <MenuItem key={item.chainId} styles={MenuItemStyles}>
              <button onClick={(_) => onNetworkSelected(item.chainId)}>
                <NetworkLabel expand chainId={item.chainId} active={currentChainId === item.chainId} color={item.color} />
              </button>
            </MenuItem>
          );
        })}

        {testnetsCollapsed ? undefined : <MenuDivider />}

        {testnetsCollapsed ? (
          <SubMenu
            label={() => (
              <button>
                <div className="network-label expand">
                  <Feather icon="radio" size={12} />
                  <span>{t('Testnets')}</span>
                </div>
              </button>
            )}
            styles={MenuItemStyles}
            className="networks-sub-menu"
          >
            {Testnets()}
          </SubMenu>
        ) : (
          Testnets()
        )}

        {showCustomize ? <MenuDivider /> : undefined}

        {showCustomize ? (
          <MenuItem styles={MenuItemStyles}>
            <button className="customize" onClick={(_) => history?.push('/networks')}>
              <div className={`network-label expand`}>
                <Feather icon="tool" size={12} /> <span>{t('Customize')}</span>
              </div>
            </button>
          </MenuItem>
        ) : undefined}
      </Menu>
    );
  }
);
