import './UserNFTs.css';

import { Image, NavBar } from '../../components';

import { AccountVM } from '../../viewmodels/AccountVM';
import { Application } from '../../viewmodels/Application';
import React from 'react';

export default ({ app, accountVM }: { app: Application; accountVM: AccountVM }) => {
  const { nfts } = accountVM;

  return (
    <div className="page nfts">
      <NavBar title="NFTs" onBackClick={app.history.goBack} />

      <div className="content">
        {(nfts || []).map((item) => {
          return (
            <div className="card">
              <Image src={item.image_url} defaultType="nft" />

              <div className="title">{item.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
