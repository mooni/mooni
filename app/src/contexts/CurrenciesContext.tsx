import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Currency } from '../lib/trading/currencyTypes';
import ParaswapWrapper, { CurrencyBalances } from '../lib/wrappers/paraswap';
import { fiatCurrencies } from '../lib/trading/currencyList';
import { getAddress } from '../redux/wallet/selectors';

type CurrenciesContextType = {
  inputCurrencies: Currency[];
  currencyBalances: CurrencyBalances;
  getCurrency: (CurrencySymbol) => Currency | null;
};

export const CurrenciesContext = createContext<CurrenciesContextType>({
  inputCurrencies: [],
  currencyBalances: {},
  getCurrency: () => null,
});

export const CurrenciesContextProvider: React.FC = ({ children }) => {
  const [inputCurrencies, setInputCurrencies] = useState<Currency[]>([]);
  const [currencyBalances, setCurrencyBalances] = useState<CurrencyBalances>({});
  const address = useSelector(getAddress);

  useEffect(() => {
    ParaswapWrapper.getTokenList()
      .then(currencies => {
        setInputCurrencies(currencies);
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
    const currencies = ([] as Currency[]).concat(fiatCurrencies).concat(inputCurrencies);
    const c = currencies.find(c => c.symbol === symbol);
    return c || null;
  }, [inputCurrencies]);

  return (
    <CurrenciesContext.Provider
      value={{
        inputCurrencies,
        currencyBalances,
        getCurrency,
      }}
    >
      {children}
    </CurrenciesContext.Provider>
  );
};