import BN from 'bignumber.js';
import { useState, useEffect, useCallback } from 'react';
import { TradeExact } from '../lib/types';
import { DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY } from '../lib/currencies';
import { getRate } from '../lib/exchange';
import { useDebounce } from './utils';
import { useBalance } from './balance';
import { logError } from '../lib/log';

const defaultRateForm = initialRequest => {
  let values = initialRequest ?
    {
      inputCurrency: initialRequest.inputCurrency,
      outputCurrency: initialRequest.outputCurrency,
      inputAmount: initialRequest.tradeExact === TradeExact.INPUT ? initialRequest.amount : null,
      outputAmount: initialRequest.tradeExact === TradeExact.OUTPUT ? initialRequest.amount : null,
      tradeExact: initialRequest.tradeExact,
    }
    :
    {
      inputCurrency: DEFAULT_INPUT_CURRENCY,
      outputCurrency: DEFAULT_OUTPUT_CURRENCY,
      inputAmount: null,
      outputAmount: 100,
      tradeExact: TradeExact.OUTPUT,
      fees: null,
    };

  return {
    loading: true,
    errors: null,
    values,
  };
};

const LOW_OUTPUT_AMOUNT = 10;

export function useRate(initialRequest) {
  const [rateForm, setRateForm] = useState(() => defaultRateForm(initialRequest));
  const [rateRequest, setRateRequest] = useState(null);
  const { balance } = useBalance(rateForm.values.inputCurrency);

  useEffect(() => {
    setRateForm(defaultRateForm(initialRequest));
  }, [initialRequest]);

  const estimate = useCallback(async (_rateForm, _balance) => {
    if(!_rateForm.loading) return;

    const currentRequest = {
      inputCurrency: _rateForm.values.inputCurrency,
      outputCurrency: _rateForm.values.outputCurrency,
      tradeExact: _rateForm.values.tradeExact,
      amount: _rateForm.values.tradeExact === TradeExact.INPUT ? _rateForm.values.inputAmount : _rateForm.values.outputAmount,
    };

    if(_balance !== null && currentRequest.tradeExact === TradeExact.INPUT && new BN(currentRequest.amount).gt(_balance)) {
      setRateForm(r => ({
        ...r,
        loading: false,
        errors: {
          lowBalance: true,
        },
      }));
      return;
    } else if(currentRequest.tradeExact === TradeExact.OUTPUT && new BN(currentRequest.amount).lt(LOW_OUTPUT_AMOUNT)) {
      setRateForm(r => ({
        ...r,
        loading: false,
        errors: {
          lowAmount: true,
        },
      }));
      return;
    }

    const res = await getRate(currentRequest);

    const updateRateForm = {
      loading: false,
      values: {
        ..._rateForm.values,
        fees: res.fees,
      },
      errors: null,
    };
    if(currentRequest.tradeExact === TradeExact.INPUT) {
      updateRateForm.values.outputAmount = new BN(res.outputAmount).toFixed();
      if(new BN(res.outputAmount).lt(LOW_OUTPUT_AMOUNT)) {
        updateRateForm.errors = { lowAmount: true };
      }
    }
    if(currentRequest.tradeExact === TradeExact.OUTPUT) {
      updateRateForm.values.inputAmount = new BN(res.inputAmount).toFixed();
      if(_balance !== null && new BN(res.inputAmount).gt(_balance)) {
        updateRateForm.errors = { lowBalance: true };
      }
    }

    setRateForm(r => ({
      ...r,
      ...updateRateForm,
    }));

    if(!updateRateForm.errors) {
      setRateRequest(currentRequest);
    } else {
      setRateRequest(null);
    }

  }, []);

  const onChangeCurrency = useCallback(tradeExact => currency => {
    const currencyKey = tradeExact === TradeExact.INPUT ? 'inputCurrency' : 'outputCurrency';
    setRateForm(r => ({
      ...r,
      loading: true,
      values: {
        ...r.values,
        [currencyKey]: currency
      }
    }))
  },[]);

  const onChangeAmount = useCallback(tradeExact => e => {
    const amount = e.target.value;

    setRateForm(r => ({
      ...r,
      loading: true,
      values: {
        ...r.values,
        tradeExact,
        inputAmount: tradeExact === TradeExact.INPUT ? amount : null,
        outputAmount: tradeExact === TradeExact.OUTPUT ? amount : null,
      }
    }))
  }, []);

  const debouncedRateForm = useDebounce(rateForm, 1000);
  useEffect(() => {
    estimate(debouncedRateForm, balance).catch(error => {
      logError('unable to fetch rates', error);
    });
  }, [debouncedRateForm, balance]);
  useEffect(() => {
    setRateForm(r => ({
      ...r,
      loading: true,
    }));
  }, [balance]);

  return {
    rateForm,
    rateRequest,
    onChangeCurrency,
    onChangeAmount,
    LOW_OUTPUT_AMOUNT,
  };
}
