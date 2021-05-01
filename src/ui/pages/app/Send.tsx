import './Send.css';

import Feather from 'feather-icons-react';
import { NavBar } from '../../components';
import React from 'react';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import Select from 'react-select';
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

export default observer((props) => {
  return (
    <div className="page send">
      <NavBar title="Send" />

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

        <div className="gas"></div>
      </div>
    </div>
  );
});
