import '@szhsin/react-menu/dist/index.css';
import './NetworkMenu.css';

import { Menu, MenuButton, MenuDivider, MenuItem, MenuPosition, SubMenu } from '@szhsin/react-menu';

import { INetwork } from '../../misc/Networks';
import NetworkLabel from './NetworkLabel';
import React from 'react';
import { observer } from 'mobx-react-lite';

const MenuItemStyles = { padding: 0 };

interface Props {
  showAutoSwitch?: boolean;
  publicNetworks: INetwork[];
  testnets: INetwork[];
  onNetworkSelected: (chainId: number) => void;
  currentChainId: number;
  position?: MenuPosition;
  collapsed?: boolean;
}

export default observer(
  ({ publicNetworks, testnets, currentChainId, onNetworkSelected, showAutoSwitch, position, collapsed }: Props) => {
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
          <MenuButton className="menu-button">
            <NetworkLabel chainId={currentChainId} />
          </MenuButton>
        )}
        styles={{ minWidth: '5.5rem' }}
        direction="bottom"
        overflow="auto"
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

        <MenuDivider />

        {collapsed ? (
          <SubMenu label="Testnets" className="networks-sub-menu">
            {Testnets()}
          </SubMenu>
        ) : (
          Testnets()
        )}
      </Menu>
    );
  }
);
