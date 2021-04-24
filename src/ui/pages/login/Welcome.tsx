import React from 'react';
import './Welcome.css';

export default () => {
  return (
    <div className="page welcome">
      <div className="brand">
        <span className="logo">Wallet 3</span>
      </div>

      <div className="actions">
        <button>IMPORT</button>
        <button>CREATE</button>
      </div>
    </div>
  );
};
