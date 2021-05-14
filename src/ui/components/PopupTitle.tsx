import './PopupTitle.css';

import Feather from 'feather-icons-react';
import Logo from './Logo';
import React from 'react';

export default ({ title, icon }: { title?: string; icon?: string }) => {
  return (
    <div className="pop-title">
      <div className="title">
        {icon ? <Feather icon={icon} size={15} /> : undefined}
        <span>{title}</span>
      </div>
      <Logo width={72} fill="#00000020" />
    </div>
  );
};
