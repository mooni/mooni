import {ChainId} from '@uniswap/sdk';
import {ethers} from "ethers";
import ERC20_ABI from '../abis/ERC20.json';
import {CurrencySymbol} from "./types";

export enum CurrencyType {
  FIAT = 'FIAT',
  CRYPTO = 'CRYPTO',
  ERC20 = 'ERC20',
}

export interface CurrencyObject {
  type: CurrencyType;
  decimals: number;
  symbol: CurrencySymbol;
  address?: string;
  chainId?: ChainId;
}

export abstract class Currency {
  public readonly type: CurrencyType;
  public readonly decimals: number;
  public readonly symbol: CurrencySymbol;
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

  toObject(): CurrencyObject {
    return {
      type: this.type,
      decimals: this.decimals,
      symbol: this.symbol,
    }
  }
}

export class FiatCurrency extends Currency {
  constructor(symbol, name?) {
    super(CurrencyType.FIAT, 2, symbol, name);
  }
}

export class CryptoCurrency extends Currency {
  constructor(decimals, symbol, name?) {
    super(CurrencyType.CRYPTO, decimals, symbol, name);
  }
}

export class TokenCurrency extends Currency {
  public readonly address: string;
  public readonly chainId: ChainId;
  public readonly img: string;
  private contract?: ethers.Contract;

  constructor(decimals, address, chainId, symbol, name?, img?) {
    super(CurrencyType.ERC20, decimals, symbol, name);
    this.address = ethers.utils.getAddress(address);
    this.chainId = chainId;
    this.img = img;
  }

  equals(token: TokenCurrency) {
    return super.equals(token) && (
      this.address.toLowerCase() === token.address.toLowerCase() &&
      this.chainId === token.chainId
    );
  }

  getContract(provider: ethers.providers.BaseProvider) {
    if(!this.contract) {
      this.contract = new ethers.Contract(this.address, ERC20_ABI, provider);
    }
    return this.contract;
  }

  toObject(): CurrencyObject {
    return {
      type: this.type,
      decimals: this.decimals,
      symbol: this.symbol,
      address: this.address,
      chainId: this.chainId,
    };
  }
}

export function createFromCurrencyObject(currencyObject: CurrencyObject): Currency {
  switch(currencyObject.type) {
    case CurrencyType.FIAT:
      return new FiatCurrency(currencyObject.symbol);

    case CurrencyType.CRYPTO:
      return new CryptoCurrency(currencyObject.decimals, currencyObject.symbol);

    case CurrencyType.ERC20:
      return new TokenCurrency(currencyObject.decimals, currencyObject.address, currencyObject.chainId, currencyObject.symbol);

    default:
      throw new Error('unknown currency type')
  }
}