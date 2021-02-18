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

export enum ApprovalState {
  UNKNOWN,
  LOADING,
  NOT_APPROVED,
  MINING,
  APPROVED
}

export interface ApprovalData {
  approvalState: ApprovalState,
  approveAllowance: () => Promise<void>,
}

export function useAllowance(symbol: CurrencySymbol): string | null {
  const currency = useCurrency(symbol);
  const ethManager = useSelector(getETHManager);
  const userAddress = useSelector(getAddress);

  const [allowance, setAllowance] = useState<string | null>(null);

  useEffect(() => {
    if(!userAddress || currency.equals(ETHER)) {
      setAllowance(null);
      return;
    }

    if(!(currency instanceof TokenCurrency)) {
      logError('invalid currency for allowance', new MetaError('unable to get allowance for currency', { symbol: currency.symbol }));
      setAllowance(null);
      return;
    }

    const updateBalance = () => {
      setAllowance(null);
      DexProxy.getSpender(currency.symbol)
        .then(spenderAddress =>
          DexProxy.getAllowance(currency, userAddress, spenderAddress)
        )
        .then(allowance => {
          setAllowance(allowance);
        })
        .catch(error => {
          logError('error while fetching allowance', error);
        });
    };

    updateBalance();
    ethManager.provider.on('block', updateBalance);
    return () => ethManager.provider.removeListener('block', updateBalance);

  }, [currency, userAddress, ethManager]);

  return allowance;
}

export function useApproval(symbol: CurrencySymbol, amount: string): ApprovalData {
  const currency = useCurrency(symbol);
  const ethManager = useSelector(getETHManager);
  const userAddress = useSelector(getAddress);
  const allowance = useAllowance(symbol);
  const [approvalState, setApprovalState] = useState<ApprovalState>(ApprovalState.UNKNOWN);

  useEffect(() => {
    if(currency.equals(ETHER)) {
      setApprovalState(ApprovalState.APPROVED);
      return;
    }

    if(!allowance) {
      setApprovalState(ApprovalState.LOADING);
    }

    if(allowance) {
      if(new BN(allowance).gte(amount)) {
        setApprovalState(ApprovalState.APPROVED);
        return;
      } else {
        setApprovalState(ApprovalState.NOT_APPROVED);
        return;
      }
    }

    setApprovalState(ApprovalState.UNKNOWN);
  }, [currency, amount, allowance]);

  const approveAllowance = useCallback(async() => {
      setApprovalState(ApprovalState.MINING);
      if(!(currency instanceof TokenCurrency) || !ethManager || !userAddress) {
        throw new Error('missing something of approveAllowance');
      }
      const spenderAddress = await DexProxy.getSpender(currency.symbol);
      const txHash = await DexProxy.approve(currency, userAddress, spenderAddress, amount, ethManager.provider)
        .catch(error => {
          setApprovalState(ApprovalState.NOT_APPROVED);
          throw detectWalletError(error)
        });

      await ethManager.waitForConfirmedTransaction(txHash);

      setApprovalState(ApprovalState.APPROVED);
    },
    [currency, userAddress, amount, ethManager]
  );

  return { approvalState, approveAllowance };
}
