import './UserNFTs.css';

import { Image, NavBar } from '../../components';

import { Application } from '../../viewmodels/Application';
import { Link } from 'react-router-dom';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ app }: { app: Application }) => {
  const { nfts } = app.currentWallet.currentAccount;

  return (
    <div className="page nfts">
      <NavBar title="NFTs" onBackClick={app.history.goBack} />

      <div className="content">
        {(nfts || []).map((item) => {
          return (
            <Link to={`/transferNFT/${item.contract}:${item.tokenId}`} key={`${item.contract}:${item.tokenId}`}>
              <div className="card">
                <Image src={item.image_url} defaultType="nft" />

                <div className="title">{item.name}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
});
