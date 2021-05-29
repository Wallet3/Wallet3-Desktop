import '@szhsin/react-menu/dist/index.css';

import { Menu, MenuButton, MenuDivider, MenuItem, MenuPosition } from '@szhsin/react-menu';

import { INetwork } from '../viewmodels/NetworksVM';
import NetworkLabel from './NetworkLabel';
import React from 'react';
import { observer } from 'mobx-react-lite';

const MenuItemStyles = { padding: '8px 12px' };

export default observer(
  ({
    publicNetworks,
    testnets,
    currentChainId,
    onNetworkSelected,
    showAutoSwitch,
    position,
  }: {
    showAutoSwitch?: boolean;
    publicNetworks: INetwork[];
    testnets: INetwork[];
    onNetworkSelected: (chainId: number) => void;
    currentChainId: number;
    position?: MenuPosition;
  }) => {
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
          <MenuItem styles={MenuItemStyles} onClick={(_) => onNetworkSelected(0)}>
            <NetworkLabel chainId={0} expand />
          </MenuItem>
        ) : undefined}
        {showAutoSwitch ? <MenuDivider /> : undefined}

        {publicNetworks.map((item) => {
          return (
            <MenuItem key={item.chainId} styles={MenuItemStyles} onClick={(_) => onNetworkSelected(item.chainId)}>
              <NetworkLabel expand chainId={item.chainId} />
            </MenuItem>
          );
        })}

        <MenuDivider />

        {testnets.map((item) => {
          return (
            <MenuItem key={item.chainId} styles={MenuItemStyles} onClick={(_) => onNetworkSelected(item.chainId)}>
              <NetworkLabel expand chainId={item.chainId} />
            </MenuItem>
          );
        })}
      </Menu>
    );
  }
);
