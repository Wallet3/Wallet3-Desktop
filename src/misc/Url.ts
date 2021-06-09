import { TxParams } from '../common/Messages';

const Explorers = new Map<number, string>([
  [1, 'https://etherscan.io'],
  [3, 'https://ropsten.etherscan.io'],
  [4, 'https://rinkeby.etherscan.io'],
  [5, 'https://goerli.etherscan.io'],
  [42, 'https://kovan.etherscan.io'],
  [56, 'https://bscscan.io'],
  [100, 'https://blockscout.com/xdai/mainnet'],
  [128, 'https://hecoinfo.com'],

  [137, 'https://polygonscan.com'],
  [250, 'https://ftmscan.com'],
  [80001, 'https://explorer-mumbai.maticvigil.com'],
]);

export function convertTxToUrl(tx: TxParams) {
  const url = `${Explorers.get(tx.chainId)}/tx/${tx.hash}`;
  return url;
}

export function convertToAccountUrl(chainId: number, address: string) {
  return `${Explorers.get(chainId)}/address/${address}`;
}
