import {CurrencyObject, CurrencyType} from '../trading/currencyTypes';

export default ([] as CurrencyObject[]).concat([
  { type: CurrencyType.FIAT, symbol: 'EUR', name: 'Euro', decimals: 2 },
  { type: CurrencyType.FIAT, symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
])
