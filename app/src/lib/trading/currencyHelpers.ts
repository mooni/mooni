import {memoize} from 'lodash';
import {Currency, CurrencyType, Token} from "./currencyTypes";

import {cryptoCurrencies, ETHER, fiatCurrencies, tokenCurrencies} from "./currencyList";
import {amountToDecimal} from "../numbers";
import DexProxy from "./dexProxy";
import {defaultProvider} from "../web3Providers";

export function getCurrencies(type?: CurrencyType): Currency[] {
  const currencies = ([] as Currency[]).concat(fiatCurrencies).concat(cryptoCurrencies).concat(tokenCurrencies);
  const res = currencies.filter(c => !type || c.type === type);
  return res;
}
export function getTokens(): Token[] {
  return getCurrencies(CurrencyType.ERC20) as Token[];
}

export function getCurrenciesSymbols(type?: CurrencyType): string[] {
  return getCurrencies(type).map(c => c.symbol);
}

export function getCurrency(symbol: string): Currency {
  const c = getCurrencies().find(c => c.symbol === symbol);
  if(!c) {
    throw new Error('unknown currency');
  }
  return c;
}
export function getTokenFromAddress(address: string): Token {
  const t = getTokens().find(t => t.address.toLowerCase() === address.toLowerCase());
  if(!t) {
    throw new Error('unknown token');
  }
  return t;
}

export const getCurrencyLogoAddress = memoize((symbol: string): string => {
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

export function getTokenAddress(symbol: string): string {
  const token = getCurrency(symbol) as Token;
  if(!token) {
    throw new Error('unknown-token');
  }
  return token.address;
}

export async function fetchTokenBalance(tokenSymbol: string, tokenHolder: string): Promise<string> {
  const token = getCurrency(tokenSymbol) as Token;

  const tokenContract = token.getContract(defaultProvider);
  const tokenBalance = await tokenContract.balanceOf(tokenHolder);

  return amountToDecimal(tokenBalance, token.decimals);
}

export async function addTokenFromAddress(tokenAddress: string): Promise<Token> {
  const t = getTokenFromAddress(tokenAddress);
  if(t) return t;

  const token = await DexProxy.getTokenFromExchange(tokenAddress);
  if(!token) {
    throw new Error('Token not available for exchange');
  }
  tokenCurrencies.push(token);
  return token;
}

export function replaceTokens(tokens: Token[]): void {
  tokenCurrencies.splice(0, tokenCurrencies.length);
  tokenCurrencies.push(...tokens);
}
