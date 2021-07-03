import './ConnectedAppsIndicator.css';

import Feather from 'feather-icons-react';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ count }: { count: number }) => {
  return (
    <div className="connectedapps-indicator">
      <span className="count">{count}</span>
      <Feather className="icon" icon="layers" size={12} strokeWidth={1.5} />
    </div>
  );
});
