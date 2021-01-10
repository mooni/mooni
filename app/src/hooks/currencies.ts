import { Currency } from '../lib/trading/currencyTypes';
import { useMemo } from 'react';
import { getCurrency } from '../lib/trading/currencyHelpers';

export const useCurrency = (symbol) => {
  return useMemo<Currency>(() => getCurrency(symbol), [symbol]);
}