const ethereum = {
  dexs: [
    { name: 'Uniswap', url: 'https://app.uniswap.org' },
    { name: 'Curve', url: 'https://curve.fi' },
    { name: 'Sushiswap', url: 'https://app.sushi.com' },
    { name: 'Balancer', url: 'https://app.balancer.fi' },
    { name: 'dydx', url: 'https://dydx.exchange' },
    { name: 'Matcha', url: 'https://matcha.xyz' },
    { name: 'Tokenlon', url: 'https://tokenlon.im' },
    { name: 'Loopring', url: 'https://loopring.org' },
    { name: 'Kyber', url: 'https://kyberswap.com' },
    { name: 'Dodo', url: 'https://app.dodoex.io' },
  ],

  lending: [
    { name: 'Maker', url: 'https://oasis.app' },
    { name: 'Aave', url: 'https://aave.com' },
    { name: 'Compound', url: 'https://compound.finance' },
    { name: 'Liquity', url: 'https://app.liquity.fi' },
  ],

  synthetic: [
    { name: 'Synthetix', url: 'https://synthetix.io' },
    { name: 'UMA', url: 'https://umaproject.org' },
  ],

  insurance: [
    { name: 'Nexus Mutual', url: 'https://app.nexusmutual.io' },
    { name: 'Opyn', url: 'https://www.opyn.co' },
    { name: 'Armor', url: 'https://armor.fi' },
  ],

  others: [
    { name: 'Pooltogether', url: 'https://pooltogether.com' },
    { name: 'yearn', url: 'https://yearn.finance' },
    { name: 'TokenSets', url: 'https://www.tokensets.com' },
    { name: 'Tornado', url: 'https://tornado.cash' },
  ],
};

const polygon = {
  dexs: [
    { name: 'Comethswap', url: 'https://swap.cometh.io' },
    { name: 'Curve', url: 'https://polygon.curve.fi' },
    { name: 'Sushiswap', url: 'https://app.sushi.com' },
    { name: 'Dodo', url: 'https://app.dodoex.io' },
    { name: 'Quickswap', url: 'https://quickswap.exchange' },
    { name: 'Kyber', url: 'https://kyberswap.com' },
  ],

  lending: [
    { name: 'Aave', url: 'https://aave.com' },
    { name: 'SupremeX', url: 'https://matic.sxc.fi' },
  ],

  others: [
    { name: 'Polygon Bridge', url: 'https://wallet.matic.network/bridge/' },
    { name: 'Pooltogether', url: 'https://pooltogether.com' },
  ],
};

const xdai = {
  dexs: [
    { name: 'Honeyswap', url: 'https://honeyswap.org' },
    { name: 'Curve', url: 'https://xdai.curve.fi' },
    { name: 'Bao', url: 'https://alpha.baoswap.xyz' },
  ],

  lending: [
    { name: 'Honeycomb', url: 'https://1hive.io' },
    { name: 'Agave', url: 'https://agave.finance' },
  ],

  others: [{ name: 'xDai Bridge', url: 'https://bridge.xdaichain.com' }],
};

const fantom = {
  dexs: [
    { name: 'Sushiswap', url: 'https://app.sushi.com' },
    { name: 'Curve', url: 'https://ftm.curve.fi' },
  ],

  lending: [{ name: 'Cream', url: 'https://app.cream.finance' }],
};

const bsc = {
  dexs: [
    { name: 'Pancakeswap', url: 'https://pancakeswap.finance' },
    { name: 'ellipsis', url: 'https://ellipsis.finance' },
    { name: 'Dodo', url: 'https://app.dodoex.io' },
  ],

  lending: [
    { name: 'venus', url: 'https://app.venus.io/dashboard' },
    { name: 'Alpaca Finance', url: 'https://app.alpacafinance.org' },
    { name: 'Cream', url: 'https://app.cream.finance' },
  ],

  others: [
    { name: 'Binance Bridge', url: 'https://www.binance.org/bridge' },
    { name: 'Dfi.money', url: 'https://dfi.money' },
  ],
};

const heco = {
  dexs: [
    { name: 'mdex', url: 'https://ht.mdex.com/#/swap' },
    { name: 'coco', url: 'https://cocoswap.com' },
  ],
};

export default {
  1: ethereum,
  137: polygon,
  100: xdai,
  250: fantom,
  56: bsc,
  128: heco,
};
