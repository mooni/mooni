import { useState, useEffect, useCallback } from 'react';

import { ETHER } from '../lib/trading/currencyList';
import { useSelector } from 'react-redux';

import { getAddress, getETHManager } from '../redux/wallet/selectors';
import { BN } from '../lib/numbers';
import { CurrencySymbol } from '../lib/trading/types';
import { useCurrency } from './currencies';
import { TokenCurrency } from '../lib/trading/currencyTypes';
import { logError } from '../lib/log';
import { MetaError } from '../lib/errors';
import DexProxy from '../lib/trading/dexProxy';
import { detectWalletError } from '../lib/web3Wallets';

export interface AllowanceData {
  allowanceReady: boolean,
  allowanceMining: boolean,
  allowanceLoading: boolean,
  approveAllowance: () => Promise<void>,
}

export function useAllowance(symbol: CurrencySymbol, amount: string): AllowanceData {
  const currency = useCurrency(symbol);
  const ethManager = useSelector(getETHManager);
  const userAddress = useSelector(getAddress);
  const [allowanceReady, setAllowanceReady] = useState<boolean>(false);
  const [allowanceLoading, setAllowanceLoading] = useState<boolean>(false);
  const [allowanceMining, setAllowanceMining] = useState<boolean>(false);


  useEffect(() => {
    if(!userAddress || !amount) {
      setAllowanceReady(false);
      setAllowanceLoading(false);
      return;
    }
    if(currency.equals(ETHER)) {
      setAllowanceReady(true);
      setAllowanceLoading(false);
    } else if(currency instanceof TokenCurrency) {

      const updateBalance = () => {
        setAllowanceLoading(true);
        DexProxy.getSpender(currency.symbol)
          .then(spenderAddress =>
            DexProxy.getAllowance(currency, userAddress, spenderAddress)
          )
          .then(allowance => {
            const ready = new BN(allowance).gt(amount);
            setAllowanceReady(ready);
            setAllowanceLoading(false);
          })
          .catch(error => {
            logError('error while fetching allowance', error);
            setAllowanceLoading(false);
          });
      };

      updateBalance();
      ethManager.provider.on('block', updateBalance);
      return () => ethManager.provider.removeListener('block', updateBalance);

    } else {
      logError('invalid currency for balance', new MetaError('unable to get allowance for currency', { symbol: currency.symbol }));
      setAllowanceReady(false);
      setAllowanceLoading(false);
    }
  }, [currency, userAddress, amount, ethManager]);

  const approveAllowance = useCallback(async() => {
      setAllowanceMining(true);
      if(!(currency instanceof TokenCurrency) || !ethManager || !userAddress) {
        throw new Error('missing something of approveAllowance');
      }
      const spenderAddress = await DexProxy.getSpender(currency.symbol);
      const txHash = await DexProxy.approve(currency, userAddress, spenderAddress, amount, ethManager.provider)
        .catch(error => {
          setAllowanceMining(false);
          throw detectWalletError(error)
        });

      await ethManager.waitForConfirmedTransaction(txHash);

      setAllowanceReady(true);
      setAllowanceMining(false);
    },
    [currency, userAddress, amount, ethManager]
  );

  return { allowanceReady, allowanceMining, allowanceLoading, approveAllowance };
}
