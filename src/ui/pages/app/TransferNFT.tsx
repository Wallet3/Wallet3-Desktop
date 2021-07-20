import './TransferNFT.css';

import { Copy, Image, NavBar } from '../../components';
import React, { useEffect, useState } from 'react';

import { AccountVM } from '../../viewmodels/AccountVM';
import { Application } from '../../viewmodels/Application';
import Feather from 'feather-icons-react';
import { NFT } from '../../viewmodels/models/NFT';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import Shell from '../../bridges/Shell';
import { TransferVM } from '../../viewmodels/account/TransferVM';
import clipboard from '../../bridges/Clipboard';
import { convertToAccountUrl } from '../../../misc/Url';
import { formatAddress } from '../../misc/Formatter';
import { observer } from 'mobx-react-lite';
import { useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default observer(({ app, networksVM }: { app: Application; networksVM: NetworksVM }) => {
  const [transferVM, setVM] = useState<TransferVM>(null);
  const [nft, setNFT] = useState<NFT>(null);
  const [nftImageHeight, setNFTImageHeight] = useState(0);
  const { nftId } = useRouteMatch().params as { nftId?: string };
  const { t } = useTranslation();
  const accountVM = app.currentWallet.currentAccount;

  useEffect(() => {
    const { transferVM } = accountVM;
    const [contract, tokenId] = nftId.split(':');

    setVM(transferVM);
    setNFT(accountVM.nfts.find((nft) => nft.contract === contract && nft.tokenId.eq(tokenId)));

    return () => transferVM.dispose();
  }, []);

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

            <div
              style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', cursor: 'pointer' }}
              onClick={(_) => Shell.open(convertToAccountUrl(networksVM.currentChainId, nft?.contract))}
            >
              Contract: {formatAddress(nft?.contract ?? '')}
            </div>
            <div onClick={(_) => clipboard.writeText(nft?.tokenId.toString())} title={nft?.tokenId.toString()}>
              Token ID: {formatAddress(nft?.tokenId.toString(), 15, 10)}
              <Copy content={nft?.tokenId.toString()} />
            </div>
          </div>
        </div>

        <div className="transfer">
          <h4>{t('Transfer')}</h4>
          <div className="to">
            <span>{t('To')}:</span>
            <input type="text" spellCheck={false} onChange={(e) => transferVM.setRecipient(e.target.value)} />
            <Feather icon="edit" size={15} strokeWidth={2} className="edit-icon" />
          </div>
          <button disabled={!transferVM?.isNFTValid} onClick={(_) => transferVM?.sendNFT(nft)}>
            {t('Send')}
          </button>
        </div>
      </div>
    </div>
  );
});
