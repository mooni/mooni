import {ChainId} from '@uniswap/sdk';

import config from '../../config';
import {CryptoCurrency, Token, FiatCurrency} from './currencyTypes';

export const ETHER = new CryptoCurrency(18, 'ETH', 'Ether');

export const fiatCurrencies = [
  new FiatCurrency('EUR', 'Euro'),
  new FiatCurrency('CHF', 'Swiss Franc'),
];
export const cryptoCurrencies = [
  ETHER
];
export const tokenCurrenciesAllNetwork = [
  new Token(18, '0x6B175474E89094C44Da98b954EedeAC495271d0F', ChainId.MAINNET, 'DAI'),
  new Token(18, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', ChainId.MAINNET, 'USDC'),
  new Token(18, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', ChainId.MAINNET, 'WBTC'),
  new Token(18, '0x2448eE2641d78CC42D7AD76498917359D961A783', ChainId.RINKEBY, 'DAI'),
];
export const tokenCurrencies = tokenCurrenciesAllNetwork.filter(t => t.chainId === config.chainId) as Token[];

export const DEFAULT_INPUT_CURRENCY = 'DAI';
export const DEFAULT_OUTPUT_CURRENCY = 'EUR';
