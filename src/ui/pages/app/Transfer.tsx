import './Transfer.css';

import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu';
import React, { useEffect, useRef, useState } from 'react';

import AnimatedNumber from 'react-animated-number';
import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import { NavBar } from '../../components';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import TokenLabel from '../../components/TokenLabel';
import { WalletVM } from '../../viewmodels/WalletVM';
import { formatNum } from '../../misc/Formatter';
import { observer } from 'mobx-react-lite';

const AddressSearchStyle = {
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

export default observer(({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const [activeGas, setActiveGas] = useState(1);
  const { transferVM } = walletVM.currentAccount;
  const amountInput = useRef<HTMLInputElement>();
  const gasInput = useRef<HTMLInputElement>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    transferVM.selectToken(params.get('token'));
  }, [app]);

  return (
    <div className="page send">
      <NavBar title="Transfer" onBackClick={() => app.history.goBack()} />

      <div className="form">
        <div className="to">
          <span>To:</span>
          <ReactSearchAutocomplete
            showIcon={false}
            inputDebounce={500}
            items={transferVM.receipts}
            styling={AddressSearchStyle}
            placeholder="Receipt Address or ENS"
            onSearch={(s, r) => transferVM.setReceipt(s)}
            onSelect={(item) => transferVM.setReceipt(item.name)}
          />
          <Feather icon="edit" size={15} strokeWidth={2} className="edit-icon" />
        </div>

        {transferVM.isEns ? <div className="ens-resolve">{transferVM.receiptAddress}</div> : undefined}

        <div className="amount">
          <span>Amount:</span>
          <input ref={amountInput} type="text" placeholder="1000" onChange={(e) => transferVM.setAmount(e.target.value)} />
          <span className="symbol">{transferVM.selectedToken.display_symbol || transferVM.selectedToken.symbol}</span>
        </div>

        <div className="tokens">
          <span></span>
          <span
            className="balance"
            onClick={(_) => {
              amountInput.current.value = transferVM.selectedToken.amount.toString();
              transferVM.setAmount(transferVM.selectedToken.amount.toString());
            }}
          >
            Max: <AnimatedNumber value={transferVM.selectedToken?.amount ?? 0} formatValue={(n) => formatNum(n, '')} />
          </span>
          <Menu
            overflow="auto"
            styles={{ minWidth: '0', marginRight: '12px' }}
            menuButton={() => (
              <MenuButton className="menu-button">
                <TokenLabel
                  symbol={transferVM.selectedToken?.display_symbol || transferVM.selectedToken?.symbol}
                  name={transferVM.selectedToken?.display_symbol || transferVM.selectedToken?.symbol}
                />
              </MenuButton>
            )}
          >
            {walletVM.currentAccount?.tokens.map((t) => {
              return (
                <MenuItem
                  key={t.id}
                  styles={{ padding: '0.375rem 1rem' }}
                  onClick={(_) => {
                    transferVM.setToken(t);
                    amountInput.current.value = '';
                  }}
                >
                  <TokenLabel symbol={t.display_symbol || t.symbol} name={t.display_symbol || t.symbol} expand />
                </MenuItem>
              );
            })}
          </Menu>
        </div>

        <div className="amount">
          <span>Gas:</span>
          <input
            type="text"
            placeholder={`${transferVM.gas}`}
            onChange={(e) => transferVM.setGas(Number.parseInt(e.target.value))}
          />
          <span></span>
        </div>

        <div className="amount">
          <span>Nonce:</span>
          <input
            type="text"
            placeholder={`${transferVM.nonce}`}
            onChange={(e) => transferVM.setNonce(Number.parseInt(e.target.value))}
          />
          <span></span>
        </div>

        <div className="gas">
          <div
            className={`${activeGas === 0 ? 'active' : ''}`}
            onClick={(_) => {
              setActiveGas(0);
              transferVM.setGasLevel(0);
            }}
          >
            <span>Rapid</span>
            <span style={{ color: '#2ecc71' }}>
              <AnimatedNumber value={transferVM.rapid} duration={300} formatValue={(n) => parseInt(n)} /> Gwei
            </span>
          </div>

          <div className="separator" />

          <div
            className={`${activeGas === 1 ? 'active' : ''}`}
            onClick={(_) => {
              setActiveGas(1);
              transferVM.setGasLevel(1);
            }}
          >
            <span>Fast</span>
            <span style={{ color: 'orange' }}>
              <AnimatedNumber value={transferVM.fast} duration={300} formatValue={(n) => parseInt(n)} /> Gwei
            </span>
          </div>

          <div className="separator" />

          <div
            className={`${activeGas === 2 ? 'active' : ''}`}
            onClick={(_) => {
              setActiveGas(2);
              transferVM.setGasLevel(2);
            }}
          >
            <span>Standard</span>
            <span style={{ color: 'deepskyblue' }}>
              <AnimatedNumber value={transferVM.standard} duration={300} formatValue={(n) => parseInt(n)} /> Gwei
            </span>
          </div>

          <div className="separator" />

          <div className={`${activeGas === 3 ? 'active' : ''}`} onClick={(_) => setActiveGas(3)}>
            <span>Cust.</span>
            <input
              ref={gasInput}
              type="text"
              placeholder="20"
              onClick={(_) => {
                setActiveGas(3);
                transferVM.setGasLevel(3);
              }}
              onChange={(e) => transferVM.setGasPrice(Number.parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      <button
        disabled={!transferVM.isValid || transferVM.insufficientFee}
        onClick={(_) => transferVM.sendTx().then(() => app.history.goBack())}
      >
        {transferVM.insufficientFee ? 'INSUFFICIENT FEE' : 'Send'}
      </button>
    </div>
  );
});
