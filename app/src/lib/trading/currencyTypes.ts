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
  name?: string;
  chainId?: ChainId;
  img?: string;
}

export abstract class Currency {
  public readonly type: CurrencyType;
  public readonly decimals: number;
  public readonly symbol: CurrencySymbol;
  private readonly _name?: string;
  public readonly img?: string;

  constructor(type, decimals, symbol, name?, img?) {
    this.type = type;
    this.decimals = decimals;
    this.symbol = symbol;
    this.img = img;
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
      name: this.name,
    }
  }
}

export class FiatCurrency extends Currency {
  constructor(decimals, symbol, name?, img?) {
    super(CurrencyType.FIAT, decimals, symbol, name, img);
  }
}

export class CryptoCurrency extends Currency {
  constructor(decimals, symbol, name?, img?) {
    super(CurrencyType.CRYPTO, decimals, symbol, name, img);
  }
}

export class TokenCurrency extends Currency {
  public readonly address: string;
  public readonly chainId: ChainId;
  private contract?: ethers.Contract;

  constructor(decimals, address, chainId, symbol, name?, img?) {
    super(CurrencyType.ERC20, decimals, symbol, name, img);
    this.address = ethers.utils.getAddress(address);
    this.chainId = chainId;
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
    return Object.assign({}, super.toObject(), {
      type: this.type,
      decimals: this.decimals,
      symbol: this.symbol,
      address: this.address,
      chainId: this.chainId,
    });
  }
}

export function createFromCurrencyObject(currencyObject: CurrencyObject): Currency {
  switch(currencyObject.type) {
    case CurrencyType.FIAT:
      return new FiatCurrency(currencyObject.decimals, currencyObject.symbol, currencyObject.name, currencyObject.img);

    case CurrencyType.CRYPTO:
      return new CryptoCurrency(currencyObject.decimals, currencyObject.symbol, currencyObject.name, currencyObject.img);

    case CurrencyType.ERC20:
      return new TokenCurrency(currencyObject.decimals, currencyObject.address, currencyObject.chainId, currencyObject.symbol, currencyObject.name, currencyObject.img);

    default:
      throw new Error('unknown currency type')
  }
}
