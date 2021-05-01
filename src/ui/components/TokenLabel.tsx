import './TokenLabel.css';
import '../misc/Icons';

import Icons from '../misc/Icons';
import React from 'react';

export default ({ symbol, name, expand, label }: { symbol: string; name: string; expand?: boolean; label?: string }) => {
  return (
    <div className={`token-label ${expand ? 'expand' : ''}`} title={label}>
      <img src={Icons(symbol)} alt={name} />
      <span>{name}</span>
    </div>
  );
};
