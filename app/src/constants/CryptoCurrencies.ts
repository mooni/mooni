import { CurrencyObject, CurrencyType } from '../lib/trading/currencyTypes'

export default ([] as CurrencyObject[]).concat([
  { type: CurrencyType.CRYPTO, symbol: 'ETH', name: 'Ether', decimals: 18 },
])
