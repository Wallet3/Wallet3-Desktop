import Apps from '../../assets/icons/app/apps.svg';
import DefaultCoin from '../../assets/icons/app/coin.svg';

export const CryptoIcons = (symbol: string) => {
  if (!symbol) return DefaultCoin;

  const s = symbol.toLowerCase();

  try {
    return require(`../../assets/icons/crypto/${s}.svg`).default;
  } catch (error) {
    return DefaultCoin;
  }
};

export const FlagIcons = (country: string) => {
  const img = require(`../../assets/icons/flags/${country.toLowerCase()}.svg`).default;
  return img;
};

export const NetworkIcons = (network: string) => {
  const img = require(`../../assets/icons/networks/${network.toLowerCase()}.svg`).default;
  return img;
};

export const AppsIcon = Apps;
export { DefaultCoin };
