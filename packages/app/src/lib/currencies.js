import { ETH } from '@uniswap/sdk';

export const TOKEN_DATA = {
  DAI: {
    tokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  USDC: {
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  WBTC: {
    tokenAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  },
};

export const ENABLE_TOKENS = true;

export const INPUT_CURRENCIES = [ETH].concat(ENABLE_TOKENS ? Object.keys(TOKEN_DATA) : []);
export const OUTPUT_CURRENCIES = ['EUR', 'CHF'];

export const DEFAULT_INPUT_CURRENCY = 'DAI';
export const DEFAULT_OUTPUT_CURRENCY = 'EUR';

export function getCurrencyLogoAddress(symbol) {
  if(symbol === ETH) {
    return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
  } else if(OUTPUT_CURRENCIES.indexOf(symbol) !== -1){
    return `/images/coinIcons/${symbol}.svg`;
  }
  const tokenAddress = TOKEN_DATA[symbol].tokenAddress;
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`;
}

export const SIGNIFICANT_DIGITS = 7;
