import { useState, useEffect, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { CurrenciesContext } from '../contexts/CurrenciesContext';
import { getWalletStatus } from '../redux/wallet/selectors';
import { CurrenciesMap, Currency } from '../lib/trading/currencyTypes';
import { WalletStatus } from '../redux/wallet/state';
import { CurrencyBalances } from '../lib/wrappers/paraswap';
import { ETHER } from '../lib/trading/currencyList';
import { amountToDecimal, BN } from '../lib/numbers';

export const useCurrency = (symbol) => {
  const { getCurrency } = useContext(CurrenciesContext);
  return useMemo(() => getCurrency(symbol), [symbol, getCurrency]);
}


function sortCurrenciesByBalance(currencies: Currency[], currencyBalances: CurrencyBalances) {
  return currencies.sort((a, b) => {
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

function onlyHeldCurrencies(currenciesMap: CurrenciesMap, currencyBalances: CurrencyBalances): Currency[] {
  const heldCurrencies = Object.keys(currencyBalances)
    .map(symbol => currenciesMap[symbol])
    .filter(c => c !== undefined) as Currency[];

  return sortCurrenciesByBalance(heldCurrencies, currencyBalances);
}
export const useTokenList = () => {
  const { inputCurrenciesMap, currencyBalances } = useContext(CurrenciesContext);
  const walletStatus = useSelector(getWalletStatus);

  const [currencyList, setCurrencyList] = useState<Currency[]>(Object.values(inputCurrenciesMap));

  useEffect(() => {
      if(walletStatus === WalletStatus.CONNECTED) {
        setCurrencyList(onlyHeldCurrencies(inputCurrenciesMap, currencyBalances));
      } else {
        setCurrencyList(Object.values(inputCurrenciesMap));
      }
    },
    [inputCurrenciesMap, currencyBalances, walletStatus]
  );

  return currencyList;
}
