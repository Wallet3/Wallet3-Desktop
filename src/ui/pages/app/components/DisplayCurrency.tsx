import './DisplayCurrency.css';

import { FlagIcons } from '../../../misc/Icons';
import React from 'react';

export default ({ flag, label, mini }: { flag?: string; label?: string; mini?: boolean }) => {
  return (
    <div className={`display-currency ${mini ? 'mini' : ''}`}>
      <img src={FlagIcons(flag)} alt={flag} />
      <span>{label ?? flag?.toUpperCase()}</span>
    </div>
  );
};
