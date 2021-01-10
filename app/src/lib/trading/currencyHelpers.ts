import {memoize} from 'lodash';
import {Currency, CurrencyType, TokenCurrency} from "./currencyTypes";

import {cryptoCurrencies, ETHER, fiatCurrencies, tokenCurrencies} from "./currencyList";
import {amountToDecimal} from "../numbers";
import DexProxy from "./dexProxy";
import {defaultProvider} from "../web3Providers";
import {CurrencySymbol} from "./types";

export function getCurrencies(type?: CurrencyType): Currency[] {
  const currencies = ([] as Currency[]).concat(fiatCurrencies).concat(cryptoCurrencies).concat(tokenCurrencies);
  const res = currencies.filter(c => !type || c.type === type);
  return res;
}

export function getTokens(): TokenCurrency[] {
  return getCurrencies(CurrencyType.ERC20) as TokenCurrency[];
}

export function getCurrenciesSymbols(type?: CurrencyType): string[] {
  return getCurrencies(type).map(c => c.symbol);
}

export function getCurrency(symbol: CurrencySymbol): Currency {
  const c = getCurrencies().find(c => c.symbol === symbol);
  if(!c) {
    throw new Error('unknown currency');
  }
  return c;
}

export const getCurrencyLogoAddress = memoize((symbol: CurrencySymbol): string => {
  const currency = getCurrency(symbol);
  if(currency.equals(ETHER)) {
    return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
  } else if(currency.type === CurrencyType.FIAT){
    return `/images/coinIcons/${symbol}.svg`;
  } else {
    const tokenAddress = getTokenAddress(symbol);
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`;
  }
});

export function getTokenAddress(symbol: CurrencySymbol): string {
  const token = getCurrency(symbol) as TokenCurrency;
  if(!token) {
    throw new Error('unknown-token');
  }
  return token.address;
}

export async function fetchTokenBalance(tokenSymbol: CurrencySymbol, tokenHolder: string): Promise<string> {
  const token = getCurrency(tokenSymbol) as TokenCurrency;

  const tokenContract = token.getContract(defaultProvider);
  const tokenBalance = await tokenContract.balanceOf(tokenHolder);

  return amountToDecimal(tokenBalance.toString(), token.decimals);
}

export async function addTokenFromAddress(tokenAddress: string): Promise<TokenCurrency> {
  const t = getTokens().find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
  if(t) return t;

  const token = await DexProxy.getTokenFromAddress(tokenAddress);
  if(!token) {
    throw new Error('Token not available for exchange');
  }
  tokenCurrencies.push(token);
  return token;
}
