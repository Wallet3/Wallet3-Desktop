import 'react-codes-input/lib/react-codes-input.min.css';

import React, { useState } from 'react';

import { NavBar } from '../../components';
import Passcode from 'react-codes-input';

export default (props) => {
  const [passcode, setPasscode] = useState('');

  return (
    <div className="page setupPw">
      <NavBar title="Setup Password" />

      <Passcode id="passcode" hide initialFocus onChange={(e) => console.log(e)} focusColor="#6186ff" />
    </div>
  );
};
