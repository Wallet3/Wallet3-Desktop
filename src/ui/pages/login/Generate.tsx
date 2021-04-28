import './Generate.css';
import './Styles.css';

import FeatherIcon from 'feather-icons-react';
import React from 'react';

export default () => {
  return (
    <div className="page generate">
      <div>
        <div className="nav">
          <button className="icon-button">
            <FeatherIcon icon="arrow-left" size={17} />
          </button>
          <h3>Mnemonic</h3>
        </div>
        <h5>Security Tips</h5>
        <ul>
          <li>The mnemonic consists of English words, please keep them safe.</li>
          <li>Once the mnemonic gets lost, it cannot be retrieved, and you may lose all your funds.</li>
        </ul>
      </div>

      <div className="seeds no-drag">
        <table>
          <tbody>
            <tr>
              <td>
                <div>
                  <span>apple</span>
                  <span className="no">1</span>
                </div>
              </td>
              <td>
                <div>
                  <span>banana</span>
                  <span className="no">2</span>
                </div>
              </td>
              <td>
                <div>
                  <span>fruits</span>
                  <span className="no">3</span>
                </div>
              </td>
              <td>
                <div>
                  <span>ipad</span>
                  <span className="no">4</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div>
                  <span>system</span>
                  <span className="no">5</span>
                </div>
              </td>
              <td>
                <div>
                  <span>welcome</span>
                  <span className="no">6</span>
                </div>
              </td>
              <td>
                <div>
                  <span>menu</span>
                  <span className="no">7</span>
                </div>
              </td>
              <td>
                <div>
                  <span>bilibili</span>
                  <span className="no">8</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div>
                  <span>duck</span>
                  <span className="no">9</span>
                </div>
              </td>
              <td>
                <div>
                  <span>javascript</span>
                  <span className="no">10</span>
                </div>
              </td>
              <td>
                <div>
                  <span>mask</span>
                  <span className="no">11</span>
                </div>
              </td>
              <td>
                <div>
                  <span>box</span>
                  <span className="no">12</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="actions">
          <div className="addr">
            <span>Address: </span>
            <span className="addr-value">0x02ba0f0fdDf21D061f99F108844bc2b1CA05126C</span>
          </div>

          <div className="switch">
            <span className="button active">12</span>
            <span> | </span>
            <span className="button">24</span>
          </div>

          <div className="icon">
            <span className="button">
              <FeatherIcon icon="refresh-cw" size="12" />
            </span>
          </div>
        </div>
      </div>

      <div className="padding"></div>

      <button>NEXT</button>
    </div>
  );
};
