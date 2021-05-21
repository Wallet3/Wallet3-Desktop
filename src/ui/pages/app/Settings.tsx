import './Settings.css';

import { CryptoIcons, FlagIcons } from '../../misc/Icons';

import React from 'react';
import Select from 'react-select';
import { WalletVM } from '../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';

const tokens = [
  { value: 'usd', label: 'USD' },
  { value: 'eth', label: 'ETH' },
];

const icon = (symbol: string) => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundImage: `url(${symbol === 'eth' ? CryptoIcons(symbol) : FlagIcons(symbol)})`,
    backgroundSize: 'cover',
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 19,
    width: 19,
  },
});

const customStyles = {
  option: (provided, state) => {
    return {
      ...provided,
      ...icon(state.value),
    };
  },
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';
    return { ...provided, opacity, transition, ...icon(state.data.value) };
  },
};

export default observer(({ walletVM }: { walletVM: WalletVM }) => {
  const accounts = walletVM.accounts.map((a, i) => {
    const addr = `${a.address.substring(0, 7)}...${a.address.substring(a.address.length - 5)}`;
    return {
      label: `${a.ens ? a.ens.substring(0, 15) : `Account ${i + 1}`} | ${addr}`,
      value: a,
    };
  });

  return (
    <div className="page settings">
      <div className="accounts">
        <div className="actions">
          <span className="title">Accounts</span>
          <span className="gen-account">Generate</span>
        </div>
        <Select options={accounts} isClearable={false} isSearchable={false} defaultValue={accounts[0]} />
      </div>

      <div>
        <span className="title">Display Currency</span>

        <Select
          options={tokens}
          styles={customStyles}
          defaultValue={tokens[0]}
          isClearable={false}
          isSearchable={false}
          // onChange={(item) => {
          //   this.props.onChange?.(item!['value']);
          //   this.setState({ selected: item });
          // }}
        />
      </div>
    </div>
  );
});
