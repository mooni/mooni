import config from '../../config';
import {CryptoCurrency, TokenCurrency, FiatCurrency, createFromCurrencyObject} from './currencyTypes';
import {CurrencySymbol} from "./types";
import FiatCurrenciesDefault from "../constants/FiatCurrencies";
import CryptoCurrenciesDefault from "../constants/CryptoCurrencies";
import TokenCurrenciesDefault from "../constants/TokenCurrencies";

export const fiatCurrencies: FiatCurrency[] = FiatCurrenciesDefault.map(createFromCurrencyObject);
export const cryptoCurrencies: CryptoCurrency[] = CryptoCurrenciesDefault.map(createFromCurrencyObject);
export const tokenCurrenciesAllNetwork: TokenCurrency[] = TokenCurrenciesDefault.map(createFromCurrencyObject) as TokenCurrency[];
export const tokenCurrencies = tokenCurrenciesAllNetwork.filter(t => t.chainId === config.chainId);

export const ETHER = cryptoCurrencies.find(c => c.symbol === 'ETH') as CryptoCurrency;

export const DEFAULT_INPUT_CURRENCY: CurrencySymbol = 'DAI';
export const DEFAULT_OUTPUT_CURRENCY: CurrencySymbol = 'EUR';
