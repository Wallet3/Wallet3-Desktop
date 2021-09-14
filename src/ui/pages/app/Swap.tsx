import './Swap.css';

import { DAI, IToken, USDC } from '../../../misc/Tokens';
import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu';

import { Application } from '../../viewmodels/Application';
import { CryptoIcons } from '../../misc/Icons';
import Feather from 'feather-icons-react';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import PuffLoader from 'react-spinners/PuffLoader';
import React from 'react';
import { SwapVM } from '../../viewmodels/SwapVM';
import UtilityBar from './components/UtilityBar';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { utils } from 'ethers';

interface IConstructor {
  app: Application;
  networksVM: NetworksVM;
  swapVM: SwapVM;
}

export default observer(({ app, networksVM, swapVM }: IConstructor) => {
  const { t } = useTranslation();
  const fromAmountRef = useRef<HTMLInputElement>();

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
        styles={{ overflow: 'hidden', marginRight: '12px' }}
        style={{ marginTop: 1 }}
        menuButton={() => (
          <MenuButton className="menu-button">
            <TokenLabel symbol={selectedToken?.symbol ?? ''} name={selectedToken?.symbol ?? ''} />
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

  useEffect(() => {
    if (!swapVM.from) swapVM.init();

    return () => swapVM.clean();
  }, []);

  return (
    <div className="page swap">
      <UtilityBar app={app} networksVM={networksVM} />

      <div className="swap-container">
        <div className="swap">
          <div className="max">
            <span
              onClick={(_) => {
                const value = utils.formatUnits(swapVM.max, swapVM.from?.decimals);
                swapVM.setFromAmount(value);
                fromAmountRef.current.value = value;
              }}
            >
              Max: {utils.formatUnits(swapVM.max, swapVM.from?.decimals || 0)}
            </span>
          </div>

          <div className="swapbox from">
            <input
              ref={fromAmountRef}
              type="text"
              autoFocus
              placeholder="0.00"
              onChange={(e) => swapVM.setFromAmount(e.target.value)}
            />

            {swapVM.fromList.length > 0 ? (
              <TokenMenu selectedToken={swapVM.from} tokens={swapVM.fromList} onTokenSelected={(t) => swapVM.selectFrom(t)} />
            ) : (
              <div className="empty-menu-placeholder" />
            )}
          </div>

          <div
            className="arrow"
            onClick={(_) => {
              swapVM.interchange();
              fromAmountRef.current.value = '';
            }}
          >
            <Feather icon="arrow-down" size={12} />
          </div>

          <div className="swapbox">
            <input type="text" readOnly value={swapVM.forAmount} />

            {swapVM.forList.length > 0 ? (
              <TokenMenu selectedToken={swapVM.for} tokens={swapVM.forList} onTokenSelected={(t) => swapVM.selectFor(t)} />
            ) : (
              <div className="empty-menu-placeholder" />
            )}
          </div>

          <div className="info">
            <div className="slippages">
              {t('Slippage')}:
              <span className={`${swapVM.slippage === 0.5 ? 'active' : ''}`} onClick={(_) => swapVM.setSlippage(0.5)}>
                0.5%
              </span>
              <span className={`${swapVM.slippage === 1 ? 'active' : ''}`} onClick={(_) => swapVM.setSlippage(1)}>
                1%
              </span>
              <span className={`${swapVM.slippage === 2 ? 'active' : ''}`} onClick={(_) => swapVM.setSlippage(2)}>
                2%
              </span>
            </div>
            <span>
              {t('Fee')}: {swapVM.fee}%
            </span>
          </div>
        </div>

        {!swapVM.approved ? (
          <button
            disabled={!swapVM.fromAmount || swapVM.approving || swapVM.fromList.length === 0}
            onClick={(_) => swapVM.approve()}
          >
            {swapVM.approving ? <PuffLoader size={15} color="#dfe8f9" /> : <span>{t('Approve')}</span>}
          </button>
        ) : undefined}

        {swapVM.approved ? (
          <button disabled={!swapVM.isValid || swapVM.swapping} onClick={(_) => swapVM.swap()}>
            {swapVM.swapping ? <PuffLoader size={15} color="#dfe8f9" /> : <span>{t('Swap')}</span>}
          </button>
        ) : undefined}
      </div>
    </div>
  );
});
