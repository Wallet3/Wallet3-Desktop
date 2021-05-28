import './Validation.css';

import React from 'react';

interface Props {
  id?: string;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

export default (props: Props) => {
  return (
    <div className="validation" {...props}>
      <svg id="validation" version="1.1" viewBox="0 0 130.2 130.2">
        <circle
          className="path circle"
          fill="none"
          stroke={props.color || '#2ecc71'}
          strokeWidth="5"
          strokeMiterlimit="10"
          cx="65.1"
          cy="65.1"
          r="62.1"
        />
        <polyline
          className="path check"
          fill="none"
          stroke={props.color || '#2ecc71'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeMiterlimit="10"
          points="100.2,40.2 51.5,88.8 29.8,67.5 "
        />
      </svg>
    </div>
  );
};
