import {ChainId} from '@uniswap/sdk';
import {ethers} from "ethers";
import ERC20_ABI from '../abis/ERC20.json';
import {CurrencySymbol} from "./types";

export enum CurrencyType {
  FIAT = 'FIAT',
  CRYPTO = 'CRYPTO',
  ERC20 = 'ERC20',
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

export class Token extends Currency {
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

  equals(token: Token) {
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
}
