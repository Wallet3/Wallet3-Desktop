import { TxParams } from '../common/Messages';

export function convertTxToUrl(tx: TxParams) {
  let url = '';

  switch (tx.chainId) {
    case 1:
      url = `https://etherscan.io/tx/${tx.hash}`;
      break;
    case 3:
      url = `https://ropsten.etherscan.io/tx/${tx.hash}`;
      break;
    case 4:
      url = `https://rinkeby.etherscan.io/tx/${tx.hash}`;
      break;
    case 5:
      url = `https://goerli.etherscan.io/tx/${tx.hash}`;
      break;
    case 42:
      url = `https://kovan.etherscan.io/tx/${tx.hash}`;
      break;
    case 56:
      url = `https://bscscan.io/tx/${tx.hash}`;
      break;
    case 100:
      url = `https://blockscout.com/xdai/mainnet/tx/${tx.hash}`;
      break;
    case 137:
      url = `https://explorer-mainnet.maticvigil.com/tx/${tx.hash}`;
      break;
    case 128:
      url = `https://hecoinfo.com/tx/${tx.hash}`;
      break;
  }

  return url;
}
