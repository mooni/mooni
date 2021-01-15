import { useContext, useMemo } from 'react';
import { CurrenciesContext } from '../contexts/CurrenciesContext';
import { Currency, TokenCurrency } from '../lib/trading/currencyTypes';
import { CurrencyBalances } from '../lib/wrappers/paraswap';
import { ETHER } from '../lib/trading/currencyList';
import { amountToDecimal, BN } from '../lib/numbers';

export const useCurrency = (symbol) => {
  const { getCurrency } = useContext(CurrenciesContext);
  return useMemo(() => getCurrency(symbol), [symbol, getCurrency]);
}


function sortCurrencies(currencies: Currency[], currencyBalances: CurrencyBalances) {
  return currencies.slice().sort((a, b) => {
    if(a.equals(ETHER)) return -1;
    else if(b.equals(ETHER)) return 1;
    else if (currencyBalances[a.symbol] && currencyBalances[b.symbol]) {
      const av = amountToDecimal(currencyBalances[a.symbol].balance, a.decimals);
      const bv = amountToDecimal(currencyBalances[b.symbol].balance, b.decimals);
      const diff = new BN(bv).minus(av);
      return diff.gt(0) ? 1:-1;
    } else if (currencyBalances[a.symbol] && !currencyBalances[b.symbol]) {
      return -1;
    } else if (!currencyBalances[a.symbol] && currencyBalances[b.symbol]) {
      return 1;
    } else {
      return 0;
    }
  })
}

function searchFunction(currency: Currency, searchValue: string) {
  if(searchValue === '') return true;

  const sl = searchValue.toLowerCase().trim();

  if((currency as TokenCurrency).address?.toLowerCase() === sl)
    return true;
  else if(currency.symbol.toLowerCase().includes(sl))
    return true;
  else
    return false;
}

const useSortedList = (currencyList: Currency[], currencyBalances: CurrencyBalances) => {
  return useMemo(() =>
    sortCurrencies(currencyList, currencyBalances)
  , [currencyList, currencyBalances]);
}

const useFilteredList = (currencyList: Currency[], searchValue: string) => {
  return useMemo(() =>
    currencyList.filter(c => searchFunction(c, searchValue))
  , [currencyList, searchValue]);
}

export const useTokenList = (searchValue: string) => {
  const { inputCurrenciesMap, currencyBalances } = useContext(CurrenciesContext);

  const currencies = useMemo(() => Object.values(inputCurrenciesMap), [inputCurrenciesMap]);
  const sortedCurrencyList = useSortedList(currencies, currencyBalances);
  const filteredCurrencyList = useFilteredList(sortedCurrencyList, searchValue);

  return filteredCurrencyList;
}
