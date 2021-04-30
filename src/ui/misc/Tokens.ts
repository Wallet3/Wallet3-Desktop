import { comparer } from 'mobx';

export interface IToken {
  address: string;
  decimals: number;
  name: string;
}

export const ETH = {
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  decimals: 18,
  name: 'ETH',
};

export const ETH_0 = {
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  name: 'ETH',
};

export const DAI = {
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18,
  name: 'DAI',
};

export const USDC = {
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  decimals: 6,
  name: 'USDC',
};

export const USDT = {
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  decimals: 6,
  name: 'USDT',
};

export const TUSD = {
  address: '0x0000000000085d4780B73119b644AE5ecd22b376',
  decimals: 18,
  name: 'TUSD',
};

export const BUSD = {
  address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
  decimals: 18,
  name: 'BUSD',
};

export const sUSD = {
  address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
  decimals: 18,
  name: 'sUSD',
};

export const PAX = {
  address: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
  decimals: 18,
  name: 'PAX',
};

export const WBTC = {
  address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  decimals: 8,
  name: 'WBTC',
};

export const renBTC = {
  address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
  decimals: 8,
  name: 'renBTC',
};

export const hBTC = {
  address: '0x0316EB71485b0Ab14103307bf65a021042c6d380',
  decimals: 18,
  name: 'hBTC',
};

export const sBTC = {
  address: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
  decimals: 18,
  name: 'sBTC',
};

export const tBTC = {
  address: '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa',
  decimals: 18,
  name: 'tBTC',
};

export const USDN = {
  address: '0x674C6Ad92Fd080e4004b2312b45f796a192D27a0',
  decimals: 18,
  name: 'USDN',
};

export const GUSD = {
  address: '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
  decimals: 2,
  name: 'GUSD',
};

export const HUSD = {
  address: '0xdF574c24545E5FfEcb9a659c229253D4111d87e1',
  decimals: 8,
  name: 'HUSD',
};

export const LINKUSD = {
  address: '0x0E2EC54fC0B509F445631Bf4b91AB8168230C752',
  decimals: 18,
  name: 'LINKUSD',
};

export const mUSD = {
  address: '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5',
  decimals: 18,
  name: 'mUSD',
};

export const RSV = {
  address: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
  decimals: 18,
  name: 'RSV',
};

export const USDK = {
  address: '0x1c48f86ae57291F7686349F12601910BD8D470bb',
  decimals: 18,
  name: 'USDK',
};

export const USDP = {
  address: '0x1456688345527bE1f37E9e627DA0837D6f08C925',
  decimals: 18,
  name: 'USDP',
};

export const sETH = {
  address: '0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb',
  decimals: 18,
  name: 'sETH',
};

export const stETH = {
  address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  decimals: 18,
  name: 'stETH',
};

export const ankrETH = {
  address: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
  decimals: 18,
  name: 'AnkrETH',
};

export const ESD = {
  address: '0x36F3FD68E7325a35EB768F1AedaAe9EA0689d723', // Empty Set Dollar
  decimals: 18,
  name: 'ESD',
};

export const DSD = {
  address: '0xBD2F0Cd039E0BFcf88901C98c0bFAc5ab27566e3', // Dynamic Set Dollar
  decimals: 18,
  name: 'DSD',
};

export const UST = {
  address: '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD',
  decimals: 18,
  name: 'UST',
};

export const BAC = {
  address: '0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a', // Basis Cash
  decimals: 18,
  name: 'BAC',
};

export const WETH = {
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  decimals: 18,
  name: 'WETH',
};

export const CRV = {
  address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
  decimals: 18,
  name: 'CRV',
};

export const LINK = {
  address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  decimals: 18,
  name: 'LINK',
};

export const DPI = {
  address: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b',
  decimals: 18,
  name: 'DPI',
};

export const RAI = {
  address: '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',
  decimals: 18,
  name: 'RAI',
};

export const LON = {
  address: '0x0000000000095413afC295d19EDeb1Ad7B71c952',
  decimals: 18,
  name: 'LON',
};

export const AAVE = {
  address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  decimals: 18,
  name: 'AAVE',
};

export const MKR = {
  address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  decimals: 18,
  name: 'MKR',
};

export const bALPHA = {
  address: '0x7a5ce6abD131EA6B148a022CB76fc180ae3315A6',
  decimals: 18,
  name: 'bALPHA',
};

export const SNX = {
  address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  decimals: 18,
  name: 'SNX',
};

export const EURS = {
  address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
  decimals: 2,
  name: 'EURS',
};

export const UNI = {
  address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  decimals: 18,
  name: 'UNI',
};

export const SUSHI = {
  address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
  decimals: 18,
  name: 'SUSHI',
};

export const YFI = {
  address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  decimals: 18,
  name: 'YFI',
};

export const COMP = {
  address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  decimals: 18,
  name: 'COMP',
};

export const RPL = {
  address: '0xB4EFd85c19999D84251304bDA99E90B92300Bd93',
  decimals: 18,
  name: 'RPL',
};

export const Stablecoins = [DAI, USDC, USDT, TUSD, BUSD, sUSD, PAX, USDN, GUSD, USDK, mUSD, RSV, LINKUSD, HUSD];
export const AlgorithmStablecoins = [ESD, DSD];
export const ETHTokens = [ETH, sETH, WETH, ETH_0];
export const BTCTokens = [WBTC, renBTC, hBTC, tBTC, sBTC];
export const DeFiTokens = [CRV, UNI, SUSHI, YFI, COMP, SNX];

export default [...Stablecoins, ...ETHTokens, ...BTCTokens, ...AlgorithmStablecoins, ...DeFiTokens];
