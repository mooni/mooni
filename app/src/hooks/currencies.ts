import { useContext, useMemo } from 'react';
import { CurrenciesContext } from '../contexts/CurrenciesContext';

export const useCurrency = (symbol) => {
  const { getCurrency } = useContext(CurrenciesContext);
  return useMemo(() => getCurrency(symbol), [symbol]);
}
