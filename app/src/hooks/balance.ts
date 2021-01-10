import { useState, useEffect } from 'react';

import { ETHER } from '../lib/trading/currencyList';
import { useSelector } from 'react-redux';

import { fetchTokenBalance } from '../lib/trading/currencyHelpers';

import { getETHManager } from '../redux/wallet/selectors';
import { amountToDecimal } from '../lib/numbers';
import { CurrencySymbol } from '../lib/trading/types';

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

    if(symbol === ETHER.symbol) {

      const updateBalance = (res) => {
        const balanceEth = amountToDecimal(res.toString(), ETHER.decimals);
        setBalance(balanceEth);
        setLoading(false);
      };

      const signer = ethManager.provider.getSigner();
      signer.getBalance().then(updateBalance);
      ethManager.provider.on(ethAddress, updateBalance);

      return () => ethManager.provider.removeListener(ethAddress, updateBalance);

    } else {

      const updateBalance = () => {
        fetchTokenBalance(symbol, ethAddress).then(res => {
          setBalance(res);
          setLoading(false);
        });
      }

      updateBalance();
      ethManager.provider.on('block', updateBalance);

      return () => ethManager.provider.removeListener('block', updateBalance);

    }
  }, [symbol, ethManager]);

  return { balanceAvailable, balanceLoading, balance, symbol };
}
