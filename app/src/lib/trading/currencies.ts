import {memoize} from 'lodash';
import BN from 'bignumber.js';
import {ChainId} from '@uniswap/sdk';
import {ethers} from 'ethers';

import config from '../../config';
import {defaultProvider} from '../web3Providers';
import ERC20 from '../abis/ERC20.json';

export enum CurrencyType {
  FIAT = 'FIAT',
  CRYPTO = 'CRYPTO',
  ERC20 = 'ERC20',
}

export abstract class Currency {
  public readonly type: CurrencyType;
  public readonly decimals: number;
  public readonly symbol: string;
  private readonly _name?: string;

  constructor(type, decimals, symbol, name?) {
    this.type = type;
    this.decimals = decimals;
    this.symbol = symbol;
    this._name = name;
  }

  equals(currency: Currency) {
    return (
      this.type === currency.type &&
      this.symbol === currency.symbol
    );
  }

  get name(): string {
    return this._name || this.symbol;
  }
}

class FiatCurrency extends Currency {
  constructor(symbol, name?) {
    super(CurrencyType.FIAT, 2, symbol, name);
  }
}
class CryptoCurrency extends Currency {
  constructor(decimals, symbol, name?) {
    super(CurrencyType.CRYPTO, decimals, symbol, name);
  }
}
export class Token extends Currency {
  public readonly address: string;
  public readonly chainId: ChainId;

  constructor(decimals, address, chainId, symbol, name?) {
    super(CurrencyType.ERC20, decimals, symbol, name);
    this.address = address;
    this.chainId = chainId;
  }

  equals(token: Token) {
    return super.equals(token) && (
      this.address === token.address &&
      this.chainId === token.chainId
    );
  }
}

const ETHER = new CryptoCurrency(18, 'ETH', 'Ether');

const fiatCurrencies = [
  new FiatCurrency('EUR', 'Euro'),
  new FiatCurrency('CHF', 'Swiss Franc'),
];
const cryptoCurrencies = [
  ETHER
];
const tokenCurrenciesAllNetwork = [
  new Token(18, '0x6B175474E89094C44Da98b954EedeAC495271d0F', ChainId.MAINNET, 'DAI'),
  new Token(18, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', ChainId.MAINNET, 'USDC'),
  new Token(18, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', ChainId.MAINNET, 'WBTC'),
  new Token(18, '0x2448eE2641d78CC42D7AD76498917359D961A783', ChainId.RINKEBY, 'DAI'),
];
const tokenCurrencies = tokenCurrenciesAllNetwork.filter(t => t.chainId === config.chainId) as Token[];

const currencies = ([] as Currency[]).concat(fiatCurrencies).concat(cryptoCurrencies).concat(tokenCurrencies);

const fiatSymbols = fiatCurrencies.map(c => c.symbol);
const cryptoSymbols = cryptoCurrencies.map(c => c.symbol);
const tokenSymbols = tokenCurrencies.map(c => c.symbol);

export { ETHER, fiatSymbols, cryptoSymbols, tokenSymbols, currencies };

export const DEFAULT_INPUT_CURRENCY = 'DAI';
export const DEFAULT_OUTPUT_CURRENCY = 'EUR';

export const SIGNIFICANT_DIGITS = 7;

export const getCurrencyLogoAddress = memoize((symbol) => {
  if(symbol === ETHER.symbol) {
    return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
  } else if(fiatSymbols.includes(symbol)){
    return `/images/coinIcons/${symbol}.svg`;
  }
  const tokenAddress = getTokenAddress(symbol);
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`;
});

export function getTokenAddress(symbol) {
  const token = tokenCurrencies.find(t => t.symbol === symbol);
  if(!token) {
    throw new Error('unknown-token');
  }
  return token.address;
}

export async function fetchTokenSymbol(tokenAddress) {
  let contract = new ethers.Contract(tokenAddress, ERC20, defaultProvider);
  return contract.symbol();
}

// TODO move as an action
export async function addToken(tokenAddress) {
  // TODO check exchangeability
  const checksumAddress = ethers.utils.getAddress(tokenAddress);
  const symbol = await fetchTokenSymbol(checksumAddress);
  // TODO
  // tokenCurrencies[symbol] = checksumAddress;
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

export function getCurrency(symbol: string): Currency {
  const c = currencies.find(c => c.symbol === symbol);
  if(!c) {
    throw new Error('unknown currency');
  }
  return c;
}
