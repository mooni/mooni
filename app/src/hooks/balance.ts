import { useState, useEffect } from 'react';

import { ETHER } from '../lib/trading/currencyList';
import { useSelector } from 'react-redux';

import { getETHManager } from '../redux/wallet/selectors';
import { amountToDecimal } from '../lib/numbers';
import { CurrencySymbol } from '../lib/trading/types';
import { useCurrency } from './currencies';
import { TokenCurrency } from '../lib/trading/currencyTypes';
import { logError } from '../lib/log';
import { MetaError } from '../lib/errors';

export interface BalanceData {
  symbol: CurrencySymbol,
  balance: string,
  balanceLoading: boolean,
  balanceAvailable: boolean,
}

export function useBalance(symbol: CurrencySymbol): BalanceData {
  const ethManager = useSelector(getETHManager);
  const [balance, setBalance] = useState<string>('0');
  const [balanceLoading, setLoading] = useState<boolean>(true);
  const [balanceAvailable, setBalanceAvailable] = useState<boolean>(false);

  const currency = useCurrency(symbol);

  useEffect(() => {
    setLoading(true);

    if(!ethManager) {
      setLoading(false);
      setBalanceAvailable(false);
      setBalance('0');
      return;
    }

    setBalanceAvailable(true);
    const ethAddress = ethManager.getAddress();

    if(currency.equals(ETHER)) {

      const updateBalance = (res) => {
        const balanceEth = amountToDecimal(res.toString(), ETHER.decimals);
        setBalance(balanceEth);
        setLoading(false);
      };

      const signer = ethManager.provider.getSigner();
      signer.getBalance().then(updateBalance);
      ethManager.provider.on(ethAddress, updateBalance);

      return () => ethManager.provider.removeListener(ethAddress, updateBalance);

    } else if(currency instanceof TokenCurrency) {

      const updateBalance = () => {
        currency.fetchBalance(ethAddress).then(res => {
          setBalance(res);
          setLoading(false);
        });
      }

      updateBalance();
      ethManager.provider.on('block', updateBalance);

      return () => ethManager.provider.removeListener('block', updateBalance);

    } else {
      const error = new MetaError('currency_balance_unavailable', {symbol: currency.symbol});
      logError(error.message, error)
    }
  }, [currency, ethManager]);

  return { balanceAvailable, balanceLoading, balance, symbol };
}
