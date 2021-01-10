import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Currency } from '../lib/trading/currencyTypes';
import ParaswapWrapper, { CurrencyBalances } from '../lib/wrappers/paraswap';
import { fiatCurrencies } from '../lib/trading/currencyList';
import { getAddress } from '../redux/wallet/selectors';
import { CurrencySymbol } from '../lib/trading/types';

export type CurrenciesMap = Record<CurrencySymbol, Currency>;

interface CurrenciesContextType {
  inputCurrencies: Currency[];
  inputCurrenciesMap: CurrenciesMap;
  currencyBalances: CurrencyBalances;
  getCurrency: (CurrencySymbol) => Currency | null;
}

export const CurrenciesContext = createContext<CurrenciesContextType>({
  inputCurrencies: [],
  inputCurrenciesMap: {},
  currencyBalances: {},
  getCurrency: () => null,
});

export const CurrenciesContextProvider: React.FC = ({ children }) => {
  const [inputCurrencies, setInputCurrencies] = useState<Currency[]>([]);
  const [inputCurrenciesMap, setInputCurrenciesMap] = useState<CurrenciesMap>({});
  const [currencyBalances, setCurrencyBalances] = useState<CurrencyBalances>({});
  const address = useSelector(getAddress);

  useEffect(() => {
    ParaswapWrapper.getTokenList()
      .then(currencies => {

        setInputCurrencies(currencies);
        setInputCurrenciesMap(currencies.reduce((acc, currency) => ({
          ...acc,
          [currency.symbol]: currency,
        }), {}));

      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if(!address) {
      setCurrencyBalances({});
      return;
    }
    ParaswapWrapper.getBalances(address)
      .then(setCurrencyBalances)
      .catch(console.error);
  }, [address]);

  const getCurrency = useCallback(symbol => {
    const fiatCurrency = fiatCurrencies.find(c => c.symbol === symbol);
    if(fiatCurrency) return fiatCurrency;
    return inputCurrencies[symbol] || null;
  }, [inputCurrencies]);

  return (
    <CurrenciesContext.Provider
      value={{
        inputCurrencies,
        inputCurrenciesMap,
        currencyBalances,
        getCurrency,
      }}
    >
      {children}
    </CurrenciesContext.Provider>
  );
};