import defaultCoin from '../../assets/icons/app/coins.svg';
import eth from '../../assets/icons/crypto2/eth.svg';

const icons = {
  eth,
};

export default (symbol: string) => {
  return icons[symbol.toLowerCase()] || defaultCoin;
};
