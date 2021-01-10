import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Currency, CurrenciesMap } from '../lib/trading/currencyTypes';
import { CurrencyBalances } from '../lib/wrappers/paraswap';
import { getAddress } from '../redux/wallet/selectors';
import CurrenciesManager from '../lib/trading/currenciesManager';

interface CurrenciesContextType {
  currenciesManager: CurrenciesManager;
  currenciesReady: boolean;
  inputCurrenciesMap: CurrenciesMap;
  currencyBalances: CurrencyBalances;
  getCurrency: (CurrencySymbol) => Currency | null;
}

export const CurrenciesContext = createContext<CurrenciesContextType>({
  currenciesManager: new CurrenciesManager(),
  currenciesReady: false,
  inputCurrenciesMap: {},
  currencyBalances: {},
  getCurrency: () => null,
});

export const CurrenciesContextProvider: React.FC = ({ children }) => {
  const currenciesManager = useMemo<CurrenciesManager>(() => new CurrenciesManager(), []);

  const [currenciesReady, setCurrenciesReady] = useState<boolean>(false);
  const [inputCurrenciesMap, setInputCurrenciesMap] = useState<CurrenciesMap>({});
  const [currencyBalances, setCurrencyBalances] = useState<CurrencyBalances>({});
  const address = useSelector(getAddress);

  useEffect(() => {
    currenciesManager.fetchCurrencies()
      .then(tradeableCurrencyMap => {
        setInputCurrenciesMap(tradeableCurrencyMap);
        setCurrenciesReady(true);
      })
      .catch(console.error);
  }, [currenciesManager]);

  useEffect(() => {
    if(!address) {
      setCurrencyBalances({});
      return;
    }
    currenciesManager.fetchBalances(address)
      .then(setCurrencyBalances)
      .catch(console.error);
  }, [address, currenciesManager]);

  return (
    <CurrenciesContext.Provider
      value={{
        currenciesManager,
        currenciesReady,
        inputCurrenciesMap,
        currencyBalances,
        getCurrency: currenciesManager.getCurrency.bind(currenciesManager),
      }}
    >
      {children}
    </CurrenciesContext.Provider>
  );
};