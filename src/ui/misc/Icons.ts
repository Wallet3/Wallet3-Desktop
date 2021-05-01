import defaultCoin from '../../assets/icons/app/coin.svg';

export default (symbol: string) => {
  try {
    return require(`../../assets/icons/crypto/${symbol.toLowerCase()}.svg`).default;
  } catch (error) {
    return defaultCoin;
  }
};
