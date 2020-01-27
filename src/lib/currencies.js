export const TOKEN_DATA = {
  DAI: {
    tokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  USDC: {
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  CHAI: {
    tokenAddress: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
  },
  ZRX: {
    tokenAddress: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
  },
  MKR: {
    tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  },
  BAT: {
    tokenAddress: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
  },
  REP: {
    tokenAddress: '0x1985365e9f78359a9B6AD760e32412f4a445E862',
  },
};

export const INPUT_CURRENCIES = ['ETH'].concat(Object.keys(TOKEN_DATA));
export const OUTPUT_CURRENCIES = ['EUR', 'CHF'];

export function getCurrencyLogoAddress(symbol) {
  if(symbol === 'ETH') {
    return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
  }
  const tokenAddress = TOKEN_DATA[symbol].tokenAddress;
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`;
}

export function getFiatLogoAddress(symbol) {
  return `/images/fiatIcons/${symbol}.svg`;
}
