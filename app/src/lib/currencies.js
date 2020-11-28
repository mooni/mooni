import { memoize } from 'lodash';
import BN from 'bignumber.js';

import { ChainId } from '@uniswap/sdk';
import config from '../config';
import { ethers } from 'ethers';
import { defaultProvider } from './web3Providers';
import ERC20 from './abis/ERC20';

const CURRENCIES_DATA = {
  networks: {
    [ChainId.MAINNET]: {
      tokens: {
        DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        // BTU: '0xb683D83a532e2Cb7DFa5275eED3698436371cc9f',
      }
    },
    [ChainId.RINKEBY]: {
      tokens: {
        DAI: '0x2448eE2641d78CC42D7AD76498917359D961A783',
      }
    },
  }
};

const ETH = 'ETH';
export { ETH };
export const TOKENS = CURRENCIES_DATA.networks[config.chainId].tokens;

export const FIAT_CURRENCIES = ['EUR', 'CHF'];

export const DEFAULT_INPUT_CURRENCY = 'DAI';
export const DEFAULT_OUTPUT_CURRENCY = 'EUR';

export const SIGNIFICANT_DIGITS = 7;

export const getCurrencyLogoAddress = memoize((symbol) => {
  if(symbol === ETH) {
    return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
  } else if(FIAT_CURRENCIES.includes(symbol)){
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

export async function fetchTokenSymbol(tokenAddress) {
  let contract = new ethers.Contract(tokenAddress, ERC20, defaultProvider);
  return contract.symbol();
}

export async function addToken(tokenAddress) {
  const checksumAddress = ethers.utils.getAddress(tokenAddress);
  const symbol = await fetchTokenSymbol(checksumAddress);
  TOKENS[symbol] = checksumAddress;
  return [symbol, checksumAddress];
}

const getTokenContract = memoize((tokenSymbol) => {
  const tokenAddress = getTokenAddress(tokenSymbol);
  return new ethers.Contract(tokenAddress, ERC20, defaultProvider);
});

const getTokenDecimals = memoize(async (tokenSymbol) => {
  const tokenContract = getTokenContract(tokenSymbol);
  return tokenContract.decimals();
});

export async function fetchTokenBalance(tokenSymbol, tokenHolder) {
  const tokenContract = getTokenContract(tokenSymbol);
  const tokenBalance = await tokenContract.balanceOf(tokenHolder);
  const tokenDecimals = await getTokenDecimals(tokenSymbol);

  return new BN(tokenBalance).div(10 ** tokenDecimals).toFixed();
}
