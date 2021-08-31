import './Swap.css';

import { DAI, IToken, USDC } from '../../../misc/Tokens';
import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu';

import { Application } from '../../viewmodels/Application';
import { CryptoIcons } from '../../misc/Icons';
import Feather from 'feather-icons-react';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import React from 'react';
import { SwapVM } from '../../viewmodels/SwapVM';
import UtilityBar from './components/UtilityBar';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { utils } from 'ethers';

interface IConstructor {
  app: Application;
  networksVM: NetworksVM;
  swapVM: SwapVM;
}

export default observer(({ app, networksVM, swapVM }: IConstructor) => {
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
            <MenuItem key={t.address} styles={{ padding: '8px 16px' }} onClick={(_) => onTokenSelected?.(t)}>
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
            <span>Max: {utils.formatUnits(swapVM.max, swapVM.from?.decimals || 0)}</span>
          </div>

          <div className="swapbox from">
            <input type="text" autoFocus placeholder="0.00" />
            <TokenMenu selectedToken={swapVM.from} tokens={swapVM.fromList} onTokenSelected={(t) => swapVM.selectFrom(t)} />
          </div>

          <div className="arrow" onClick={(_) => swapVM.interchange()}>
            <Feather icon="arrow-down" size={12} />
          </div>

          <div className="swapbox">
            <input type="text" />
            <TokenMenu selectedToken={swapVM.for} tokens={swapVM.forList} onTokenSelected={(t) => swapVM.selectFor(t)} />
          </div>

          <div className="info">
            <div className="slippages">
              {t('Slippage')}: <span className="active">0.5%</span> <span>1%</span> <span>2%</span>
            </div>
            <span>
              {t('Fee')}: {swapVM.fee}%
            </span>
          </div>
        </div>

        <button>{t('Swap')}</button>
      </div>
    </div>
  );
});
