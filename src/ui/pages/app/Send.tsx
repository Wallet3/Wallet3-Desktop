import './Send.css';

import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu';
import React, { useState } from 'react';

import AnimatedNumber from 'react-animated-number';
import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import { NavBar } from '../../components';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import TokenLabel from '../../components/TokenLabel';
import { TransferVM } from '../../viewmodels/TransferVM';
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

const items = [
  {
    id: 0,
    name: 'Cobol',
  },
  {
    id: 1,
    name: 'JavaScript',
  },
  {
    id: 2,
    name: 'Basic',
  },
  {
    id: 3,
    name: 'PHP',
  },
  {
    id: 4,
    name: 'Java',
  },
];

export default observer(({ app, walletVM }: { app: Application; walletVM: WalletVM }) => {
  const [activeGas, setActiveGas] = useState(1);
  const { transferVM } = walletVM.currentAccount;

  return (
    <div className="page send">
      <NavBar title="Send" onBackClick={() => app.history.goBack()} />

      <div className="form">
        <div className="to">
          <span>To:</span>
          <ReactSearchAutocomplete
            items={items}
            showIcon={false}
            styling={AddressSearchStyle}
            placeholder="Receipt Address"
          />
          <Feather icon="edit" size={15} strokeWidth={2} className="edit-icon" />
        </div>

        <div className="amount">
          <span>Amount:</span>
          <input type="text" placeholder="1000" onChange={(e) => (transferVM.amount = e.target.value)} />
          <span className="symbol">ETH</span>
        </div>

        <div className="tokens">
          <span></span>
          <span className="balance">
            Max: <AnimatedNumber value={transferVM.selectedToken?.amount ?? 0} formatValue={(n) => formatNum(n, '')} />
          </span>
          <Menu
            overflow="auto"
            styles={{ minWidth: '0', marginRight: '12px' }}
            menuButton={() => (
              <MenuButton className="menu-button">
                <TokenLabel symbol={transferVM.selectedToken?.symbol} name={transferVM.selectedToken?.symbol} />
              </MenuButton>
            )}
          >
            {walletVM.currentAccount?.tokens.map((t) => {
              return (
                <MenuItem key={t.id} styles={{ padding: '0.375rem 1rem' }} onClick={(_) => transferVM.setToken(t)}>
                  <TokenLabel symbol={t.symbol} name={t.display_symbol || t.symbol} expand />
                </MenuItem>
              );
            })}
          </Menu>
        </div>

        <div className="amount">
          <span>Gas:</span>
          <input type="text" placeholder="100000" />
          <span></span>
        </div>

        <div className="amount">
          <span>Nonce:</span>
          <input type="text" placeholder="1" />
          <span></span>
        </div>

        <div className="gas">
          <div className={`${activeGas === 0 ? 'active' : ''}`} onClick={(_) => setActiveGas(0)}>
            <span>Rapid</span>
            <span style={{ color: '#2ecc71' }}>
              <AnimatedNumber value={37} duration={300} formatValue={(n) => parseInt(n)} /> Gwei
            </span>
          </div>

          <div className="separator" />

          <div className={`${activeGas === 1 ? 'active' : ''}`} onClick={(_) => setActiveGas(1)}>
            <span>Fast</span>
            <span style={{ color: 'orange' }}>
              <AnimatedNumber value={32} duration={300} formatValue={(n) => parseInt(n)} /> Gwei
            </span>
          </div>

          <div className="separator" />

          <div className={`${activeGas === 2 ? 'active' : ''}`} onClick={(_) => setActiveGas(2)}>
            <span>Standard</span>
            <span style={{ color: 'deepskyblue' }}>
              <AnimatedNumber value={27} duration={300} formatValue={(n) => parseInt(n)} /> Gwei
            </span>
          </div>

          <div className="separator" />

          <div className={`${activeGas === 3 ? 'active' : ''}`} onClick={(_) => setActiveGas(3)}>
            <span>Cust.</span>
            <input type="text" placeholder="20" onClick={(_) => setActiveGas(3)} />
          </div>
        </div>
      </div>

      <button>Send</button>
    </div>
  );
});
