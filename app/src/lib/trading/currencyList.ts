import { CryptoCurrency, FiatCurrency, createFromCurrencyObject, CurrencySymbol } from './currencyTypes';
import FiatCurrenciesDefault from "../../constants/FiatCurrencies";
import CryptoCurrenciesDefault from "../../constants/CryptoCurrencies";

export const fiatCurrencies: FiatCurrency[] = FiatCurrenciesDefault.map(createFromCurrencyObject);
export const cryptoCurrencies: CryptoCurrency[] = CryptoCurrenciesDefault.map(createFromCurrencyObject);

export const ETHER = cryptoCurrencies.find(c => c.symbol === 'ETH') as CryptoCurrency;

export const DEFAULT_INPUT_CURRENCY: CurrencySymbol = 'ETH';
export const DEFAULT_OUTPUT_CURRENCY: CurrencySymbol = 'EUR';
