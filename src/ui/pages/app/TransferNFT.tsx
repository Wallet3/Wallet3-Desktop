import './TransferNFT.css';

import { Image, NavBar } from '../../components';
import React, { useEffect, useState } from 'react';

import { AccountVM } from '../../viewmodels/AccountVM';
import { Application } from '../../viewmodels/Application';
import { NFT } from '../../viewmodels/models/NFT';
import { TransferVM } from '../../viewmodels/account/TransferVM';
import { useRouteMatch } from 'react-router-dom';

export default ({ app, accountVM }: { app: Application; accountVM: AccountVM }) => {
  const [transferVM, setVM] = useState<TransferVM>(null);
  const [nft, setNFT] = useState<NFT>(null);
  const { nftId } = useRouteMatch().params as { nftId?: string };

  useEffect(() => {
    const { transferVM } = accountVM;
    const [contract, tokenId] = nftId.split(':');

    setVM(transferVM);
    setNFT(accountVM.nfts.find((nft) => nft.contract === contract && nft.tokenId.eq(tokenId)));

    return () => transferVM.dispose();
  }, []);

  return (
    <div className="page nft">
      <NavBar title={nft?.name} onBackClick={app.history.goBack} />

      <div className="content">
        <div className="nft">
          <Image src={nft?.image_url} defaultType="nft" />
        </div>
      </div>
    </div>
  );
};
