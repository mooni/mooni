import BN from 'bignumber.js';
import { useState, useEffect, useCallback } from 'react';
import { TradeExact } from '../lib/types';
import { DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY } from '../lib/currencies';
import { getRate } from '../lib/exchange';
import { useDebounce } from './utils';
import { useBalance } from './balance';

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
      fees: 0,
    };

  return {
    loading: true,
    valid: true,
    errors: {
      lowBalance: false,
      lowAmount: false,
    },
    values,
  };
};

export function useRate(initialRequest) {
  const [rateForm, setRateForm] = useState(() => defaultRateForm(initialRequest));
  const [rateRequest, setRateRequest] = useState(null);
  const { balance } = useBalance(rateForm.values.inputCurrency);

  useEffect(() => {
    setRateForm(defaultRateForm(initialRequest));
  }, [initialRequest]);

  const estimate = useCallback(async (rateForm) => {
    if(!rateForm.loading) return;

    const currentRequest = {
      inputCurrency: rateForm.values.inputCurrency,
      outputCurrency: rateForm.values.outputCurrency,
      tradeExact: rateForm.values.tradeExact,
      amount: rateForm.values.tradeExact === TradeExact.INPUT ? rateForm.values.inputAmount : rateForm.values.outputAmount,
    };

    if(currentRequest.tradeExact === TradeExact.INPUT && new BN(currentRequest.amount).gt(balance)) {
      setRateForm(r => ({
        ...r,
        loading: false,
        valid: false,
        errors: {
          lowBalance: true,
        },
      }));
      return;
    } else if(currentRequest.tradeExact === TradeExact.OUTPUT && new BN(currentRequest.amount).lt(10)) {
      setRateForm(r => ({
        ...r,
        loading: false,
        valid: false,
        errors: {
          lowAmount: true,
        },
      }));
      return;
    }

    const res = await getRate(currentRequest);

    const updateRateForm = {
      loading: false,
      valid: true,
      fees: res.fees,
      values: {
        ...rateForm.values,
      },
      errors: {},
    };
    if(currentRequest.tradeExact === TradeExact.INPUT) {
      updateRateForm.values.outputAmount = new BN(res.outputAmount).toFixed();
    }
    if(currentRequest.tradeExact === TradeExact.OUTPUT) {
      updateRateForm.values.inputAmount = new BN(res.inputAmount).toFixed();
      if(new BN(res.inputAmount).gt(balance)) {
        updateRateForm.valid = false;
        updateRateForm.errors.lowBalance = true;
      }
    }

    setRateForm(r => ({
      ...r,
      ...updateRateForm,
    }));

    if(updateRateForm.valid) {
      setRateRequest(currentRequest);
    } else {
      setRateRequest(null);
    }

  }, [balance]);

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
    estimate(debouncedRateForm).catch(console.error);
  }, [debouncedRateForm, estimate]);

  return {
    rateForm,
    rateRequest,
    onChangeCurrency,
    onChangeAmount,
  };
}
