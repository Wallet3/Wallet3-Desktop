import './Transfer.css';

import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu';
import React, { useEffect, useRef, useState } from 'react';
import { formatNum, formatValue } from '../../misc/Formatter';

import AnimatedNumber from 'react-animated-number';
import { Application } from '../../viewmodels/Application';
import BarLoader from 'react-spinners/BarLoader';
import { CurrencyVM } from '../../viewmodels/settings/CurrencyVM';
import Feather from 'feather-icons-react';
import { Gwei_1 } from '../../../gas/Gasnow';
import { NavBar } from '../../components';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import TokenLabel from '../../components/TokenLabel';
import { TransferVM } from '../../viewmodels/account/TransferVM';
import { WalletVM } from '../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';
import { useRouteMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { utils } from 'ethers';

export const AddressSearchStyle = {
  border: 'none',
  borderBottom: '1px solid #dfe8f9',
  borderRadius: '5px',
  boxShadow: 'none',
  background: 'none',
  color: '#333',
  fontSize: '12px',
  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
  iconColor: 'none',
  lineColor: '#dfe8f9',
  placeholderColor: '#d0d0d0',
};

export default observer(
  ({ app, networksVM, currencyVM }: { app: Application; networksVM: NetworksVM; currencyVM: CurrencyVM }) => {
    const { t } = useTranslation();
    const { currentWallet } = app;
    const { currentNetwork } = networksVM;

    const { tokenId } = useRouteMatch().params as { tokenId?: string };

    const [activeGas, setActiveGas] = useState(1);
    const [transferVM, setVM] = useState<TransferVM>(null);
    const amountInput = useRef<HTMLInputElement>();
    const gasInput = useRef<HTMLInputElement>();
    const [advancedMode, setAdvancedMode] = useState(false);

    useEffect(() => {
      const { transferVM } = app.currentWallet.currentAccount;

      transferVM.selectToken(tokenId);
      setVM(transferVM);

      return () => transferVM.dispose();
    }, []);

    return (
      <div className="page send">
        <NavBar title={t('Transfer')} onBackClick={() => app.history.goBack()} />

        <div className="form">
          <div className="to no-drag">
            <span>{t('To')}:</span>
            <ReactSearchAutocomplete
              showIcon={false}
              showClear={false}
              inputDebounce={500}
              items={transferVM?.recipients}
              autoFocus
              styling={AddressSearchStyle}
              placeholder={t('Recipient Address or ENS')}
              onSearch={(s, r) => transferVM?.setRecipient(s)}
              onSelect={(item) => transferVM?.setRecipient(item.name)}
            />
            <Feather icon="edit" size={15} strokeWidth={2} className="edit-icon" />
          </div>

          {transferVM?.isEns ? <div className="ens-resolve">{transferVM?.receiptAddress}</div> : undefined}

          <div className="amount">
            <span>{t('Amount')}:</span>
            <input ref={amountInput} type="text" placeholder="1000" onChange={(e) => transferVM?.setAmount(e.target.value)} />
            <span className="symbol">{transferVM?.selectedToken.symbol}</span>
          </div>

          <div className="tokens">
            <span></span>
            <span
              className="balance"
              onClick={(_) => {
                amountInput.current.value = transferVM?.selectedTokenMaxBalance.toString();
                transferVM?.setAmount(transferVM?.selectedTokenMaxBalance.toString());
              }}
            >
              {t('Max')}: <AnimatedNumber value={transferVM?.selectedToken.amount} formatValue={(n) => formatNum(n, '')} />
            </span>
            <Menu
              overflow="auto"
              styles={{ minWidth: '0', marginRight: '12px' }}
              style={{ marginTop: 1 }}
              menuButton={() => (
                <MenuButton className="menu-button">
                  <TokenLabel symbol={transferVM?.selectedToken?.symbol} name={transferVM?.selectedToken?.symbol} />
                </MenuButton>
              )}
            >
              {currentWallet.currentAccount?.allTokens.map((t) => {
                return (
                  <MenuItem
                    key={t.id}
                    styles={{ padding: '6.25px 10px' }}
                    onClick={(_) => {
                      transferVM?.setToken(t);
                      amountInput.current.value = '';
                    }}
                  >
                    <TokenLabel symbol={t.symbol} name={t.symbol} expand />
                  </MenuItem>
                );
              })}
            </Menu>
          </div>

          <div className="amount">
            <span>{t('Gas')}:</span>
            <input
              type="text"
              placeholder={`${transferVM?.gas}`}
              onChange={(e) => transferVM?.setGas(Number.parseInt(e.target.value) || 0)}
            />
            <span></span>
          </div>

          <div className="amount">
            <span>{t('Nonce')}:</span>
            <input
              type="text"
              maxLength={64}
              placeholder={`${transferVM?.nonce}`}
              onChange={(e) => transferVM?.setNonce(Number.parseInt(e.target.value) || 0)}
            />
            <span></span>
          </div>

          {currentNetwork.eip1559 ? (
            <div className="eip1559">
              <div className="line1">
                <span>Estimated Gas Fee</span>
                <span>
                  <span className="usd-value">
                    {`(${(
                      Number.parseFloat(utils.formatEther(transferVM?.estimatedEIP1559Fee ?? 0)) * currencyVM.ethPrice
                    ).toFixed(2)} USD)`}
                  </span>
                  <AnimatedNumber
                    value={transferVM?.estimatedEIP1559Fee || 0}
                    duration={300}
                    formatValue={(n: any) => formatValue(utils.formatEther(Number.parseInt(n)))}
                  />{' '}
                  ETH
                </span>
              </div>

              <div className="line2">
                <span className={`speed ${transferVM?.txSpeed ?? ''}`}>Speed: {transferVM?.txSpeed.toUpperCase()}</span>
                <span className="advanced" onClick={() => setAdvancedMode(!advancedMode)}>
                  <Feather size={11} icon={advancedMode ? 'chevrons-up' : 'chevrons-down'} /> Advanced Mode
                </span>
              </div>
            </div>
          ) : undefined}

          {!advancedMode && currentNetwork.eip1559 ? undefined : (
            <div className="gasprice-title">
              <h6>{currentNetwork.eip1559 ? t('Max Gas Fee') : t('Gas Price')}</h6>

              {networksVM.currentNetwork.eip1559 ? (
                <div className="eip1559">
                  <h6>
                    {t('Next Block Base Fee')}:{' '}
                    <AnimatedNumber value={transferVM?.nextBlockBaseFee_Wei / Gwei_1} formatValue={(n) => formatNum(n, '')} />{' '}
                    Gwei
                  </h6>
                </div>
              ) : undefined}
            </div>
          )}

          {!advancedMode && currentNetwork.eip1559 ? undefined : (
            <div className="gas">
              <div
                className={`${activeGas === 0 ? 'active' : ''}`}
                onClick={(_) => {
                  setActiveGas(0);
                  transferVM?.setGasLevel(0);
                }}
              >
                <span>{t('Rapid')}</span>
                <span className="rapid">
                  <AnimatedNumber value={transferVM?.rapid} duration={300} formatValue={(n) => parseInt(n)} /> Gwei
                </span>
              </div>

              <div className="separator" />

              <div
                className={`${activeGas === 1 ? 'active' : ''}`}
                onClick={(_) => {
                  setActiveGas(1);
                  transferVM?.setGasLevel(1);
                }}
              >
                <span>{t('Fast')}</span>
                <span className="fast">
                  <AnimatedNumber value={transferVM?.fast} duration={300} formatValue={(n) => parseInt(n)} /> Gwei
                </span>
              </div>

              <div className="separator" />

              <div
                className={`${activeGas === 2 ? 'active' : ''}`}
                onClick={(_) => {
                  setActiveGas(2);
                  transferVM?.setGasLevel(2);
                }}
              >
                <span>{t('Standard')}</span>
                <span className="standard">
                  <AnimatedNumber value={transferVM?.standard} duration={300} formatValue={(n) => parseInt(n)} /> Gwei
                </span>
              </div>

              <div className="separator" />

              <div className={`${activeGas === 3 ? 'active' : ''}`} onClick={(_) => setActiveGas(3)}>
                <span>{t('Cust.')}</span>
                <input
                  ref={gasInput}
                  type="text"
                  placeholder="20"
                  maxLength={16}
                  onClick={(_) => {
                    setActiveGas(3);
                    transferVM?.setGasLevel(3);
                    transferVM?.setGasPrice(Number.parseFloat(gasInput.current.value) || 0);
                  }}
                  onChange={(e) => transferVM?.setGasPrice(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {currentNetwork.eip1559 && advancedMode ? (
            <div className="gas-tip amount">
              <span>{t('Gas Tip')}:</span>
              <input
                type="text"
                maxLength={64}
                placeholder={`${transferVM?.priorityPrice_Wei / Gwei_1}`}
                onChange={(e) => transferVM?.setPriorityPrice(Number.parseFloat(e.target.value))}
              />
              <span>Gwei</span>
            </div>
          ) : undefined}
        </div>

        <button
          disabled={!transferVM?.isValid || transferVM?.insufficientFee || transferVM?.sending}
          onClick={(_) => transferVM?.sendTx().then(() => app.history.goBack())}
        >
          {transferVM?.loading ? (
            <BarLoader width={52} height={2} />
          ) : (
            t(transferVM?.insufficientFee ? 'INSUFFICIENT FEE' : 'Send')
          )}
        </button>
      </div>
    );
  }
);
