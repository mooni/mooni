import {memoize} from 'lodash';
import {Currency, CurrencyType, Token} from "./currencyTypes";

import {cryptoCurrencies, ETHER, fiatCurrencies, tokenCurrencies} from "./currencyList";
import {amountToDecimal} from "../numbers";
import DexProxy from "./dexProxy";

export function getCurrencies(type?: CurrencyType): Currency[] {
  const currencies = ([] as Currency[]).concat(fiatCurrencies).concat(cryptoCurrencies).concat(tokenCurrencies);
  const res = currencies.filter(c => !type || c.type === type);
  return res;
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

  const tokenContract = token.getContract();
  const tokenBalance = await tokenContract.balanceOf(tokenHolder);

  return amountToDecimal(tokenBalance, token.decimals);
}

export async function addTokenFromAddress(tokenAddress: string): Promise<Token> {
  const c = getCurrencies().find(c => c.type === CurrencyType.ERC20 && (c as Token).address.toLowerCase() === tokenAddress.toLowerCase());
  if(c) return c as Token;

  const token = await DexProxy.isTokenExchangeable(tokenAddress);
  if(!token) {
    throw new Error('Token not available for exchange');
  }
  /*
  let contract = new ethers.Contract(checksumAddress, ERC20_ABI, defaultProvider);
  const decimals = await contract.decimals();
  const symbol = await contract.symbol();
  const token = new Token(decimals, checksumAddress, config.chainId, symbol);
  */
  tokenCurrencies.push(token);
  return token;
}

export function replaceTokens(tokens: Token[]): void {
  tokenCurrencies.splice(0, tokenCurrencies.length);
  tokenCurrencies.push(...tokens);
}
