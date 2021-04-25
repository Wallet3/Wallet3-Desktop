import './Main.css';

import ETH from '../../../assets/icons/crypto/eth.svg';
import Feather from 'feather-icons-react';
import { Line } from 'rc-progress';
import React from 'react';

export default (props) => {
  return (
    <div className="page main">
      <div className="utility-bar">
        <div title="Scan QR">
          <Feather icon="instagram" size={20} stroke="#6186ff" strokeWidth={1} />
        </div>
      </div>

      <div className="net-worth">
        <h3 className="title">Net Worth</h3>
        <div className="value">$ 1,129,385.22</div>

        <div className="asset-percent">
          <Line percent={90} strokeColor="rgb(97, 134, 255)" strokeWidth={1.5} trailWidth={1.5} />
          <div className="value">
            <div>Wealth: $ 1,500,000.11</div>
            <div>Debt: $ 200,000.22</div>
          </div>
        </div>
      </div>

      <div className="wallet-actions">
        <button>
          <Feather icon="download" size={14} strokeWidth={2} />
          <span>Receive</span>
        </button>
        <button>
          <Feather icon="send" size={14} strokeWidth={2} />
          <span>Send</span>
        </button>
      </div>

      <div className="assets">
        <h3 className="title">Assets</h3>

        <table>
          <tbody>
            <tr>
              <td>
                <img src={ETH} alt="" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
