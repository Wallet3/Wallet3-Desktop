import './Wallet.css';

import React, { useEffect } from 'react';

import AnimatedNumber from 'react-animated-number';
import { Application } from '../../viewmodels/Application';
import { CryptoIcons } from '../../misc/Icons';
import Feather from 'feather-icons-react';
import GasStation from '../../../gas';
import HSBar from 'react-horizontal-stacked-bar-chart';
import { Image } from '../../components';
import { Link } from 'react-router-dom';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import Skeleton from 'react-loading-skeleton';
import { UserToken } from '../../../ui/viewmodels/models/UserToken';
import UtilityBar from './components/UtilityBar';
import { formatNum } from '../../misc/Formatter';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface IConstructor {
  app: Application;
  networksVM: NetworksVM;
}

export default observer(({ networksVM, app }: IConstructor) => {
  const { t } = useTranslation();
  const { currentAccount: accountVM, pendingTxCount } = app.currentWallet;
  const { currencyVM } = app;

  const maxRows = 6;
  const rows = accountVM.chainTokens.length / 2;
  const rowTokens: UserToken[][] =
    accountVM.chainTokens.length === 0
      ? new Array(maxRows).fill([null, null])
      : new Array(maxRows).fill([undefined, undefined]);

  for (let i = 0; i < rows && i < maxRows; i++) {
    const row: UserToken[] = [];
    for (let j = 0; j < 2; j++) {
      const token = accountVM.chainTokens[i * 2 + j];
      row.push(token);
    }

    rowTokens[i] = row;
  }

  useEffect(() => {
    app.clearHistory();
    if (pendingTxCount === 0) return;
    GasStation.refresh();
  }, []);

  return (
    <div className="page main">
      <UtilityBar app={app} networksVM={networksVM} walletVM={app.currentWallet} />

      <div className="net-worth">
        <h3 className="title">{t('Net Worth')}</h3>
        <div className="value">
          {accountVM.netWorth === undefined ? (
            <Skeleton />
          ) : (
            <AnimatedNumber
              component="span"
              value={accountVM.netWorth}
              duration={300}
              formatValue={(n) => currencyVM.format(n)}
            />
          )}
        </div>

        <div className="asset-percent">
          {accountVM?.chainsOverview.length > 0 ? (
            <HSBar height={3} showTextWithValue={false} showTextDown outlineWidth={0} data={accountVM?.chainsOverview} />
          ) : (
            <Skeleton />
          )}
        </div>
      </div>

      <div className="wallet-actions">
        <button onClick={(_) => app.scanQR()}>
          <Feather icon="camera" size={14} strokeWidth={2} />
          <span>{t('Connect')}</span>
        </button>
        <Link className={`button ${accountVM && accountVM.nativeToken ? '' : 'disabled'}`} to="/send">
          <Feather icon="send" size={14} strokeWidth={2} />
          <span>{t('Send')}</span>
        </Link>
      </div>

      <div className="assets">
        <div className="nav-title">
          <h3 className="title">{t('Assets')}</h3>
          <Link to={`/userTokens`}>
            <Feather icon="more-horizontal" size={16} strokeWidth={1} />
          </Link>
        </div>

        <table>
          <tbody>
            {rowTokens.map((row, i) => {
              return (
                <tr key={i}>
                  {row.map((token, j) => {
                    return (
                      <td key={`${i}-${j}`}>
                        {token ? (
                          <Link
                            className="button"
                            to={`/send/${token.id}`}
                            title={`${token.symbol}: $${token.amount * token.price || 0}`}
                          >
                            <div>
                              <img className="token-icon" src={CryptoIcons(token.symbol)} alt="" />
                              <span className="symbol">{token.symbol}</span>
                              <span></span>
                              <span className="amount">{formatNum(token.amount, '')}</span>
                            </div>
                          </Link>
                        ) : token === null ? (
                          <Skeleton height={20} />
                        ) : (
                          <span />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="nfts">
        <div className="nav-title">
          <h3 className="title">NFTs</h3>

          <Link to={`/userNFTs`}>
            <Feather icon="more-horizontal" size={16} strokeWidth={1} />
          </Link>
        </div>

        <div className={`tokens ${accountVM.nfts?.length === 0 || !accountVM.nfts ? 'empty' : ''}`}>
          {accountVM.nfts ? (
            accountVM.nfts.length === 0 ? (
              t('No NFTs Here')
            ) : (
              accountVM.nfts.slice(0, 12).map((nft) => {
                return (
                  <Link to={`/transferNFT/${nft.contract}:${nft.tokenId}`} key={`${nft.contract}:${nft.tokenId}`}>
                    <div className="nft">
                      <Image src={nft.image_url} alt={nft.name} defaultType="nft" />
                    </div>
                  </Link>
                );
              })
            )
          ) : (
            <Skeleton />
          )}
        </div>
      </div>
    </div>
  );
});
