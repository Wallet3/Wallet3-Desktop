import Apps from '../../assets/icons/app/apps.svg';
import DefaultCoin from '../../assets/icons/app/coin.svg';

export const CryptoIcons = (symbol: string) => {
  if (!symbol) return DefaultCoin;

  try {
    return require(`../../assets/icons/crypto/${symbol.toLowerCase()}.svg`).default;
  } catch (error) {
    return DefaultCoin;
  }
};

export const FlagIcons = (country: string) => {
  try {
    const img = require(`../../assets/icons/flags/${country.toLowerCase()}.svg`).default;
    return img;
  } catch (error) {
    return Apps;
  }
};

export const NetworkIcons = (network: string) => {
  try {
    const img = require(`../../assets/icons/networks/${network.toLowerCase()}.svg`).default;
    return img;
  } catch (error) {
    return Apps;
  }
};

export const AppsIcon = Apps;
export { DefaultCoin };
