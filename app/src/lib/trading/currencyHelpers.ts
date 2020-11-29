import {ethers} from 'ethers';
import {memoize} from 'lodash';
import {Currency, CurrencyType, Token} from "./currencyTypes";
import ERC20_ABI from '../abis/ERC20.json';
import {defaultProvider} from "../web3Providers";
import config from "../../config";

import {cryptoCurrencies, ETHER, fiatCurrencies, tokenCurrencies} from "./currencyList";
import {amountToDecimal} from "../numbers";

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

export const getCurrencyLogoAddress = memoize((symbol) => {
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

export function getTokenAddress(symbol) {
  const token = getCurrency(symbol) as Token;
  if(!token) {
    throw new Error('unknown-token');
  }
  return token.address;
}

export async function fetchTokenBalance(tokenSymbol, tokenHolder) {
  const token = getCurrency(tokenSymbol) as Token;

  const tokenContract = token.getContract();
  const tokenBalance = await tokenContract.balanceOf(tokenHolder);

  return amountToDecimal(tokenBalance, token.decimals);
}

export async function addToken(tokenAddress) {
  const checksumAddress = ethers.utils.getAddress(tokenAddress);
  let contract = new ethers.Contract(checksumAddress, ERC20_ABI, defaultProvider);
  const decimals = await contract.decimals();
  const symbol = await contract.symbol();
  const token = new Token(decimals, checksumAddress, config.chainId, symbol);
  tokenCurrencies.push(token);
  return token;
}
