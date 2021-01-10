import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Currency, CurrenciesMap } from '../lib/trading/currencyTypes';
import ParaswapWrapper, { CurrencyBalances } from '../lib/wrappers/paraswap';
import { fiatCurrencies } from '../lib/trading/currencyList';
import { getAddress } from '../redux/wallet/selectors';

interface CurrenciesContextType {
  currenciesReady: boolean;
  inputCurrenciesMap: CurrenciesMap;
  currencyBalances: CurrencyBalances;
  getCurrency: (CurrencySymbol) => Currency | null;
}

export const CurrenciesContext = createContext<CurrenciesContextType>({
  currenciesReady: false,
  inputCurrenciesMap: {},
  currencyBalances: {},
  getCurrency: () => null,
});

export const CurrenciesContextProvider: React.FC = ({ children }) => {
  const [currenciesReady, setCurrenciesReady] = useState<boolean>(false);
  const [inputCurrenciesMap, setInputCurrenciesMap] = useState<CurrenciesMap>({});
  const [currencyBalances, setCurrencyBalances] = useState<CurrencyBalances>({});
  const address = useSelector(getAddress);

  useEffect(() => {
    ParaswapWrapper.getTokenMap()
      .then(currenciesMap => {

        setInputCurrenciesMap(currenciesMap);
        setCurrenciesReady(true);

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
    return inputCurrenciesMap[symbol] || null;
  }, [inputCurrenciesMap]);

  return (
    <CurrenciesContext.Provider
      value={{
        currenciesReady,
        inputCurrenciesMap,
        currencyBalances,
        getCurrency,
      }}
    >
      {children}
    </CurrenciesContext.Provider>
  );
};