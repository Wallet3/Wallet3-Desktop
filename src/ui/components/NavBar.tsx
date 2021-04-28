import './NavBar.css';

import FeatherIcon from 'feather-icons-react';
import React from 'react';

interface Props {
  onBackClick?: () => void;
  title: string;
}

export default (props: Props) => {
  return (
    <div className="nav">
      <button className="icon-button" onClick={(_) => props?.onBackClick()}>
        <FeatherIcon icon="arrow-left" size={18} />
      </button>
      <h3>{props.title}</h3>
    </div>
  );
};
