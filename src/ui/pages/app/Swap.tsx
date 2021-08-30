import './Swap.css';

import { DAI, IToken, USDC } from '../../../misc/Tokens';
import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu';

import { Application } from '../../viewmodels/Application';
import { CryptoIcons } from '../../misc/Icons';
import Feather from 'feather-icons-react';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import React from 'react';
import TokenLabel from '../../components/TokenLabel';
import UtilityBar from './components/UtilityBar';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface IConstructor {
  app: Application;
  networksVM: NetworksVM;
}

export default observer(({ app, networksVM }: IConstructor) => {
  const { t } = useTranslation();

  const TokenLabel = ({ symbol, name }: { symbol: string; name: string }) => {
    return (
      <div className={`token-label`} title={name}>
        <img src={CryptoIcons(symbol)} alt={name} />
        <span>{name}</span>
      </div>
    );
  };

  const TokenMenu = ({
    selectedToken,
    tokens,
    onTokenSelected,
  }: {
    selectedToken: IToken;
    tokens: IToken[];
    onTokenSelected?: (token: IToken) => void;
  }) => {
    return (
      <Menu
        overflow="auto"
        styles={{ minWidth: '0', marginRight: '12px' }}
        style={{ marginTop: 1 }}
        menuButton={() => (
          <MenuButton className="menu-button">
            <TokenLabel symbol={selectedToken?.symbol} name={selectedToken?.symbol} />
          </MenuButton>
        )}
      >
        {tokens.map((t) => {
          return (
            <MenuItem key={t.address} styles={{ padding: '6.25px 10px' }} onClick={(_) => onTokenSelected?.(t)}>
              <TokenLabel symbol={t.symbol} name={t.symbol} />
            </MenuItem>
          );
        })}
      </Menu>
    );
  };

  return (
    <div className="page swap">
      <UtilityBar app={app} networksVM={networksVM} />

      <div className="swap-container">
        <div className="swap">
          <div className="max">
            <span>Max: 1234.22</span>
          </div>

          <div className="swapbox">
            <input type="text" autoFocus />
            <TokenMenu selectedToken={DAI} tokens={[]} />
          </div>

          <div className="arrow">
            <Feather icon="arrow-down" size={12} />
          </div>

          <div className="swapbox">
            <input type="text" />
            <TokenMenu selectedToken={USDC} tokens={[]} />
          </div>

          <div className="info">
            <span>Fee: 0.05%</span>
            <span>Slippage: 0.5%</span>
          </div>
        </div>

        <button>{t('Swap')}</button>
      </div>
    </div>
  );
});
