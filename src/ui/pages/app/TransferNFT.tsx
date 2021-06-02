import './TransferNFT.css';

import { Image, NavBar } from '../../components';
import React, { useEffect, useState } from 'react';

import { AccountVM } from '../../viewmodels/AccountVM';
import { AddressSearchStyle } from './Transfer';
import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import { NFT } from '../../viewmodels/models/NFT';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import { TransferVM } from '../../viewmodels/account/TransferVM';
import { formatAddress } from '../../misc/Formatter';
import { useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default ({ app, accountVM }: { app: Application; accountVM: AccountVM }) => {
  const [transferVM, setVM] = useState<TransferVM>(null);
  const [nft, setNFT] = useState<NFT>(null);
  const [nftImageHeight, setNFTImageHeight] = useState(0);
  const { nftId } = useRouteMatch().params as { nftId?: string };
  const { t } = useTranslation();

  useEffect(() => {
    const { transferVM } = accountVM;
    const [contract, tokenId] = nftId.split(':');

    setVM(transferVM);
    setNFT(accountVM.nfts.find((nft) => nft.contract === contract && nft.tokenId.eq(tokenId)));

    return () => transferVM.dispose();
  }, []);

  console.log(nftImageHeight);
  return (
    <div className="page nft">
      <NavBar title={'NFT'} onBackClick={app.history.goBack} />

      <div className="content">
        <div className="nft">
          <Image
            src={nft?.image_url}
            defaultType="nft"
            onLoad={(e) => setNFTImageHeight((e.target as HTMLImageElement).clientHeight)}
            style={{ top: -(nftImageHeight - 60) }}
          />

          <div className="details">
            <div className="name">
              <span>{nft?.name}</span>
            </div>

            <div className="desc">
              <span>{nft?.description}</span>
            </div>

            <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              Contract: {formatAddress(nft?.contract ?? '')}
            </div>
            <div>TokenID: {nft?.tokenId.toString()}</div>
          </div>
        </div>

        <div className="transfer">
          <h4>Transfer</h4>
          <div className="to">
            <span>{t('To')}:</span>
            <ReactSearchAutocomplete
              showIcon={false}
              inputDebounce={500}
              items={transferVM?.receipients}
              styling={AddressSearchStyle}
              placeholder="Receipient Address or ENS"
              onSearch={(s, r) => transferVM?.setReceipient(s)}
              onSelect={(item) => transferVM?.setReceipient(item.name)}
            />
            <Feather icon="edit" size={15} strokeWidth={2} className="edit-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};
