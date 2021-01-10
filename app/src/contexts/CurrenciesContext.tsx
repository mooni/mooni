import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Currency, CurrenciesMap } from '../lib/trading/currencyTypes';
import { CurrencyBalances } from '../lib/wrappers/paraswap';
import { getAddress } from '../redux/wallet/selectors';
import CurrenciesManager from '../lib/trading/currenciesManager';
import { setInputCurrency } from '../redux/payment/actions';
import { setModalError } from '../redux/ui/actions';
import { useAppDispatch } from '../redux/store';
import { logError } from '../lib/log';

interface CurrenciesContextType {
  currenciesManager: CurrenciesManager;
  currenciesReady: boolean;
  inputCurrenciesMap: CurrenciesMap;
  currencyBalances: CurrencyBalances;
  getCurrency: (CurrencySymbol) => Currency;
}

export const CurrenciesContext = createContext<CurrenciesContextType>({
  currenciesManager: new CurrenciesManager(),
  currenciesReady: false,
  inputCurrenciesMap: {},
  currencyBalances: {},
  getCurrency: () => { throw new Error('not_ready_getCurrency') },
});

export const CurrenciesContextProvider: React.FC = ({ children }) => {
  const currenciesManager = useMemo<CurrenciesManager>(() => new CurrenciesManager(), []);

  const [currenciesReady, setCurrenciesReady] = useState<boolean>(false);
  const [inputCurrenciesMap, setInputCurrenciesMap] = useState<CurrenciesMap>({});
  const [currencyBalances, setCurrencyBalances] = useState<CurrencyBalances>({});
  const address = useSelector(getAddress);
  const dispatch = useAppDispatch();

  useEffect(() => {
    currenciesManager.fetchCurrencies()
      .then(tradeableCurrencyMap => {
        setInputCurrenciesMap(tradeableCurrencyMap);
        setCurrenciesReady(true);
      })
      .catch(console.error); // TODO logerror
  }, [currenciesManager]);

  useEffect(() => {
    if(!address) {
      setCurrencyBalances({});
      return;
    }
    currenciesManager.fetchBalances(address)
      .then(setCurrencyBalances)
      .catch(console.error); // TODO logerror
  }, [address, currenciesManager]);

  useEffect(() => {
    if(!currenciesReady) return;
    
    const query = new URLSearchParams(window.location.search);
    const tokenAddress = query.get('token');
    if(tokenAddress) {
      try {
        const currency = currenciesManager.getTokenByAddress(tokenAddress);
        dispatch(setInputCurrency(currency.symbol));
      } catch(error) {
        logError('invalid-custom-token', error);
        dispatch(setModalError(new Error('invalid-custom-token')))
      }
    }
  }, [dispatch, currenciesManager, currenciesReady]);

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