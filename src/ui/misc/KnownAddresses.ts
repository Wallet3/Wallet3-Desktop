import Tokens from '../../misc/Tokens';

const KnownAddresses = {
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': 'Uniswap V2',
  '0xE592427A0AEce92De3Edee1F18E0157C05861564': 'Uniswap V3',
  '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b': 'OpenSea',
  '0x11111112542D85B3EF69AE05771c2dCCff4fAa26': '1inch V3',
  '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F': 'SushiSwap',
  '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506': 'SushiSwap',
  '0x722122dF12D4e14e13Ac3b6895a86e84145b6967': 'Tornado.Cash',
  '0xd1917932A7Db6Af687B523D5Db5d7f5c2734763F': 'Bulksender.app',
  '0xA0c68C638235ee32657e8f720a23ceC1bFc77C77': 'Polygon Bridge',
  '0xDef1C0ded9bec7F1a1670819833240f027b25EfF': '0x: Exchange Proxy',
  '0x881D40237659C251811CEC9c364ef91dC08D300C': 'Metamask Router',
  '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9': 'Aave',
  '0x3FDA67f7583380E67ef93072294a7fAc882FD7E7': 'Compound',
  '0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21': 'Balancer',
  '0x6317C5e82A06E1d8bf200d21F4510Ac2c038AC81': 'Balancer',
  '0xd061D61a4d941c39E5453435B6345Dc261C2fcE0': 'Curve.fi: Token Minter',
  '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD': 'Curve.fi: sUSD v2 Swap',
  '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714': 'Curve.fi: sBTC Swap',
  '0x93054188d876f558f4a66B2EF1d97d16eDf0895B': 'Curve.fi: REN Swap',
  '0x73aB2Bd10aD10F7174a1AD5AFAe3ce3D991C5047': 'Curve.fi: Ren Adapter 3',
  '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7': 'Curve.fi: 3Pool',
  '0xDeBF20617708857ebe4F679508E7b7863a8A8EeE': 'Curve.fi: Aave Pool',
  '0xc5424B857f758E906013F3555Dad202e4bdB4567': 'Curve.fi: sETH Pool',
  '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51': 'Curve.fi: y Swap',
  '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022': 'Curve.fi: stETH Pool',
  '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46': 'Curve.fi: TriCrypto2',
  '0x7f90122BF0700F9E7e1F688fe926940E8839F353': 'Curve.fi: 2Pool',
  '0x32666B64e9fD0F44916E1378Efb2CFa3B3B96e80': 'RenBridge',
  '0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e': 'dYdX',
  '0x3A22dF48d84957F907e67F4313E3D43179040d6E': 'Ygov.finance',
  '0x61935CbDd02287B511119DDb11Aeb42F1593b7Ef': '0x: Exchange v3',
  '0x5d22045DAcEAB03B158031eCB7D9d06Fad24609b': 'DeversiFi 2',
  '0x818E6FECD516Ecc3849DAf6845e3EC868087B755': 'Kyber',
  '0x9AAb3f75489902f3a48495025729a0AF77d4b11e': 'Kyber',
  '0x0BABA1Ad5bE3a5C0a66E7ac838a129Bf948f1eA4': 'Loopring: Exchange v2',
  '0xa356867fDCEa8e71AEaF87805808803806231FdC': 'Dodo DEX',
  '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F': 'Synthetix',
  '0x10ED43C718714eb63d5aA57B78B54704E256024E': 'PancakeSwap',
  '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff': 'QuickSwap Router',
  '0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97': 'Aave Polygon',
  '0x1C232F01118CB8B424793ae03F870aa7D0ac7f77': 'Honeyswap',
  '0x93bcDc45f7e62f89a8e901DC4A0E2c6C427D9F25': 'ComethSwap',
  '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf': 'Aave',
  '0xA464e6DCda8AC41e03616F95f4BC98a13b8922Dc': 'Curve Fee Distribution',
  '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5': 'ENS Registrar',
  '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB': 'CRYPTOPUNKS',
  '0x1A2a1c938CE3eC39b6D47113c7955bAa9DD454F2': 'Ronin Bridge',
  '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643': 'Compound: cDAI',
  '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E': 'Compound: cBAT',
  '0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c': 'Compound: cAAVE',
  '0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4': 'Compound: cCOMP',
  '0xFAce851a4921ce59e912d19329929CE6da6EB0c7': 'Compound: cLINK',
  '0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b': 'Compound: cMKR',
  '0x4B0181102A0112A2ef11AbEE5563bb4a3176c9d7': 'Compound: cSUSHI',
  '0x12392F67bdf24faE0AF363c24aC620a2f67DAd86': 'Compound: cTUSD',
  '0x35A18000230DA775CAc24873d00Ff85BccdeD550': 'Compound: cUNI',
  '0x39AA39c021dfbaE8faC545936693aC917d5E7563': 'Compound: cUSDC',
  '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9': 'Compound: cUSDT',
  '0xccF4429DB6322D5C611ee964527D42E5d685DD6a': 'Compound: cWBTC',
  '0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946': 'Compound: cYFI',
  '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407': 'Compound: cZRX',
  '0x0650d780292142835F6ac58dd8E2a336e87b4393': 'UNI Prize Pool',
  '0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3f': 'Arbitrum: Inbox',
  '0xC36442b4a4522E871399CD717aBDD847Ab11FE88': 'Uniswap V3 NFT',
  '0x0D5550d52428E7e3175bfc9550207e4ad3859b17': 'Tornado Matic',
  '0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb': 'Rarity',

  '0x3D5f301C93476C0Ae7d2Eab2a369DE4cbb0700aB': 'Wallet 3 Swap',
  '0x71d0e2881cEfEcf0e97499a0Cff6a6F470c05cfB': 'Wallet 3 Swap',
};

Tokens.forEach((t) => (KnownAddresses[t.address] = t.symbol));

export default KnownAddresses;
