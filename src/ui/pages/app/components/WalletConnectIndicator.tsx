import './WalletConnectIndicator.css';

import Feather from 'feather-icons-react';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ connecting }: { connecting?: boolean }) => {
  return (
    <div className={`walletconnect-indicator ${connecting ? 'connecting' : ''}`}>
      <Feather icon="link-2" size={14} strokeWidth={1.5} />
    </div>
  );
});
