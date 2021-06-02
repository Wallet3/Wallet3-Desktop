import './UserNFTs.css';

import { Image, NavBar } from '../../components';

import { AccountVM } from '../../viewmodels/AccountVM';
import { Application } from '../../viewmodels/Application';
import { Link } from 'react-router-dom';
import React from 'react';
import { observer } from 'mobx-react-lite';

export default observer(({ app, accountVM }: { app: Application; accountVM: AccountVM }) => {
  const { nfts } = accountVM;

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
