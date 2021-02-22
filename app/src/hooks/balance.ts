import { useMemo, useState, useEffect } from 'react';

import { ETHER } from '../lib/trading/currencyList';
import { useSelector } from 'react-redux';

import { getAddress, getETHManager } from '../redux/wallet/selectors';
import { amountToDecimal, BN } from '../lib/numbers';
import { useCurrency } from './currencies';
import { CurrencySymbol, TokenCurrency } from '../lib/trading/currencyTypes';
import { logError } from '../lib/log';
import { MetaError } from '../lib/errors';
import { DexTrade, MultiTradeEstimation, TradeExact, TradeRequest, TradeType } from '../lib/trading/types';
import { applySlippage, applySlippageOnTrade, MAX_SLIPPAGE } from '../lib/trading/dexProxy';

export interface BalanceData {
  balance: string,
  balanceLoading: boolean,
}

/**
 * Reads on-chain balance of an address for ETH or an ERC20 token
 * @param symbol
 */
export function useBalance(symbol: CurrencySymbol): BalanceData {
  const ethManager = useSelector(getETHManager);
  const ethAddress = useSelector(getAddress);
  const [balance, setBalance] = useState<string>('0');
  const [balanceLoading, setLoading] = useState<boolean>(true);

  const currency = useCurrency(symbol);

  useEffect(() => {
    setLoading(true);

    if(!ethManager || !ethAddress) {
      setLoading(false);
      setBalance('0');
      return;
    }

    if(currency.equals(ETHER)) {

      const updateBalance = (res) => {
        setLoading(true);
        const balanceEth = amountToDecimal(res.toString(), ETHER.decimals);
        setBalance(balanceEth);
        setLoading(false);
      };

      const signer = ethManager.provider.getSigner();
      setLoading(true);
      signer.getBalance()
        .then(updateBalance)
        .catch(error => {
          logError('error-fetching-balance-eth', error);
        });
      ethManager.provider.on(ethAddress, updateBalance);

      return () => ethManager.provider.removeListener(ethAddress, updateBalance);

    } else if(currency instanceof TokenCurrency) {

      const updateBalance = () => {
        setLoading(true);
        currency.fetchBalance(ethAddress)
          .then(res => {
            setBalance(res);
            setLoading(false);
          })
          .catch(error => {
            logError('error-fetching-balance-token', error);
          });
      }

      updateBalance();
      ethManager.provider.on('block', updateBalance);

      return () => {
        ethManager.provider.removeListener('block', updateBalance);
      };
    } else {
      const error = new MetaError('currency_balance_unavailable', {symbol: currency.symbol});
      logError(error.message, error)
    }
  }, [currency, ethManager, ethAddress]);

  return { balanceLoading, balance };
}

export const useTradeBalance = (tradeRequest: TradeRequest, multiTradeEstimation: MultiTradeEstimation | null) => {
  const { balanceLoading, balance } = useBalance(tradeRequest.inputCurrencyObject.symbol);

  const maxAmount = useMemo<string>(() => {
    if(balanceLoading) return '0';

    return tradeRequest.inputCurrencyObject.symbol !== ETHER.symbol ?
      applySlippage(balance, tradeRequest.inputCurrencyObject.decimals, -MAX_SLIPPAGE)
      :
      balance;
  }, [balance, balanceLoading, tradeRequest]);

  const insufficientBalance = useMemo(() => {
    if(
      (tradeRequest.tradeExact === TradeExact.OUTPUT && !multiTradeEstimation) ||
      balanceLoading
    ) return false;

    const inputAmount = multiTradeEstimation ?
      (multiTradeEstimation.trades[0].tradeType === TradeType.DEX ?
          applySlippageOnTrade(multiTradeEstimation.trades[0] as DexTrade).maxInputAmount
          :
          multiTradeEstimation.trades[0].inputAmount
      )
      :
      tradeRequest.amount;

    return new BN(balance).lt(inputAmount)
  }, [balance, balanceLoading, multiTradeEstimation, tradeRequest]);

  return {
    balance, balanceLoading, insufficientBalance, maxAmount,
  };
}