import ParaswapWrapper, { CurrencyBalances } from '../wrappers/paraswap';
import { CurrenciesMap, Currency } from './currencyTypes';
import { CurrencySymbol } from './types';
import { fiatCurrencies } from './currencyList';
import { MetaError } from '../errors';

export default class CurrenciesManager {
  tradeableCurrencies: Currency[] = [];
  tradeableCurrenciesMap: CurrenciesMap = {};
  currencyBalances?: CurrencyBalances;

  constructor() {}

  async fetchCurrencies(): Promise<CurrenciesMap> {
    this.tradeableCurrencies = await ParaswapWrapper.getTokenList();
    this.tradeableCurrenciesMap = this.tradeableCurrencies.reduce((acc, currency) => ({
      ...acc,
      [currency.symbol]: currency,
    }), {});
    return this.tradeableCurrenciesMap;
  }

  async fetchBalances(address: string): Promise<CurrencyBalances> {
    this.currencyBalances = await ParaswapWrapper.getBalances(address);
    return this.currencyBalances;
  }

  getCurrency(symbol: CurrencySymbol): Currency {
    const fiatCurrency = fiatCurrencies.find(c => c.symbol === symbol);
    if(fiatCurrency) return fiatCurrency;
    const tradeableCurrency = this.tradeableCurrenciesMap[symbol];
    if(!tradeableCurrency)
      throw new MetaError('currency_not_found', { symbol })
    return tradeableCurrency;
  }
}
