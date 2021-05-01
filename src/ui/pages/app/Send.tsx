import './Send.css';

import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu';

import { AccountVM } from '../../viewmodels/AccountVM';
import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import { NavBar } from '../../components';
import React from 'react';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import TokenLabel from '../../components/TokenLabel';
import { WalletVM } from '../../viewmodels/WalletVM';
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
          <input type="text" placeholder="1000" />
          <span className="symbol">ETH</span>
        </div>

        <div className="tokens">
          <span></span>
          <span className="balance">Max: 2.223</span>
          <Menu
            overflow="auto"
            styles={{ minWidth: '0', marginRight: '12px' }}
            menuButton={() => (
              <MenuButton className="menu-button">
                <TokenLabel symbol="ETH" name="ETH" />
              </MenuButton>
            )}
          >
            {walletVM.currentAccount?.tokens.map((t) => {
              return (
                <MenuItem key={t.id} styles={{ padding: '0.375rem 1rem' }}>
                  <TokenLabel symbol={t.symbol} name={t.display_symbol || t.symbol} expand />
                </MenuItem>
              );
            })}
          </Menu>
        </div>

        {/* <div></div> */}

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
          <div>
            <span>Rapid</span>
            <span style={{ color: '#2ecc71' }}>37 Gwei</span>
          </div>

          <div className="separator" />

          <div>
            <span>Fast</span>
            <span style={{ color: 'orange' }}>32 Gwei</span>
          </div>

          <div className="separator" />

          <div>
            <span>Standard</span>
            <span style={{ color: 'deepskyblue' }}>27 Gwei</span>
          </div>

          <div className="separator" />

          <div>
            <span>Cust.</span>
            <input type="text" placeholder="20" />
          </div>
        </div>
      </div>

      <button>Send</button>
    </div>
  );
});
