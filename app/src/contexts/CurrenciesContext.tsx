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

const BALANCE_REFRESH_INTERVAL = 20 * 1000;

export const CurrenciesContextProvider: React.FC = ({ children }) => {
  const currenciesManager = useMemo<CurrenciesManager>(() => new CurrenciesManager(), []);

  const [currenciesReady, setCurrenciesReady] = useState<boolean>(false);
  const [inputCurrenciesMap, setInputCurrenciesMap] = useState<CurrenciesMap>({});
  const [currencyBalances, setCurrencyBalances] = useState<CurrencyBalances>({});
  const address = useSelector(getAddress);
  const dispatch = useAppDispatch();

  // Get currency list
  useEffect(() => {
    currenciesManager.fetchCurrencies()
      .then(tradeableCurrencyMap => {
        setInputCurrenciesMap(tradeableCurrencyMap);
        setCurrenciesReady(true);
      })
      .catch(error => {
        logError('error-fetching-tokens', error);
        // TODO error on loader
      });
  }, [currenciesManager]);

  // Update balances
  useEffect(() => {
    if(!address) {
      return;
    }

    function fetchBalances() {
      currenciesManager.fetchBalances(address)
        .then(setCurrencyBalances)
        .catch(error => {
          logError('error-fetching-balances-all', error);
          // dispatch(setModalError(new Error('error-fetching-balances')))
        });
    }
    const interval = setInterval(fetchBalances, BALANCE_REFRESH_INTERVAL);
    fetchBalances();

    return () => clearInterval(interval);
  }, [dispatch, address, currenciesManager]);

  const currencyBalances_connected = useMemo(
    () => address ? currencyBalances : {},
    [address, currencyBalances]
  );

  // Get token from URL
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
        currencyBalances: currencyBalances_connected,
        getCurrency: currenciesManager.getCurrency.bind(currenciesManager),
      }}
    >
      {children}
    </CurrenciesContext.Provider>
  );
};