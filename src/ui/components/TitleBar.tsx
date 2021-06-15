import './TitleBar.css';

import React from 'react';
import close from '../../assets/icons/app/win-close.svg';
import maximize from '../../assets/icons/app/win-maximize.svg';
import minimize from '../../assets/icons/app/win-minimize.svg';

interface Props {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export default ({ onClose, onMinimize, onMaximize }: Props) => {
  return (
    <div className="system-title-bar">
      <button className="close" onClick={onClose}>
        <img src={close} draggable={false} />
      </button>
      <button className="minimize" onClick={onMinimize}>
        <img src={minimize} draggable={false} />
      </button>
      <button className="maximize" onClick={onMaximize}>
        <img src={maximize} draggable={false} />
      </button>
    </div>
  );
};
