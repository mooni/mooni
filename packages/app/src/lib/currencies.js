import { memoize } from 'lodash';

import { ETH, SUPPORTED_CHAIN_ID, getTokenReserves } from '@uniswap/sdk';
import config from '../config';
import { ethers } from 'ethers';
import { defaultProvider } from './web3Providers';
import ERC20 from './abis/ERC20';

const CURRENCIES_DATA = {
  networks: {
    [SUPPORTED_CHAIN_ID.Mainnet]: {
      tokens: {
        DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        // BTU: '0xb683D83a532e2Cb7DFa5275eED3698436371cc9f',
      }
    },
    [SUPPORTED_CHAIN_ID.Rinkeby]: {
      tokens: {
        DAI: '0x2448eE2641d78CC42D7AD76498917359D961A783',
      }
    },
  }
};

const TOKENS = CURRENCIES_DATA.networks[config.CHAIN_ID].tokens;

export const INPUT_CURRENCIES = [ETH].concat(Object.keys(TOKENS));
export const OUTPUT_CURRENCIES = ['EUR', 'CHF'];

export const DEFAULT_INPUT_CURRENCY = 'DAI';
export const DEFAULT_OUTPUT_CURRENCY = 'EUR';

export const SIGNIFICANT_DIGITS = 7;

export const getCurrencyLogoAddress = memoize((symbol) => {
  if(symbol === ETH) {
    return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
  } else if(OUTPUT_CURRENCIES.indexOf(symbol) !== -1){
    return `/images/coinIcons/${symbol}.svg`;
  }
  const tokenAddress = getTokenAddress(symbol);
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`;
});

export function getTokenAddress(symbol) {
  const tokenAddress = TOKENS[symbol];
  if(!tokenAddress) {
    throw new Error('unknown-token');
  }
  return tokenAddress;
}

export async function fetchTokenName(tokenAddress) {
  const reserves = await getTokenReserves(tokenAddress, defaultProvider);
  if(!reserves.exchange.address) throw new Error('token has no exchange available')

  let contract = new ethers.Contract(tokenAddress, ERC20, defaultProvider);
  const name = await contract.symbol();
  return name;
}

// fetchTokenName('0xb683E83a532e2Cb7DFa5275eED3698436371cc9f').then(console.log).catch(console.error)
