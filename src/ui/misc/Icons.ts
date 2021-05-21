import defaultCoin from '../../assets/icons/app/coin.svg';

export const CryptoIcons = (symbol: string) => {
  if (!symbol) return defaultCoin;

  const s = symbol.toLowerCase();

  try {
    return require(`../../assets/icons/crypto/${s}.svg`).default;
  } catch (error) {
    return defaultCoin;
  }
};

export const FlagIcons = (country: string) => {
  const img = require(`../../assets/icons/flags/${country.toLowerCase()}.svg`).default;
  console.log(img);
  return img;
};
