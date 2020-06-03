import BN from 'bignumber.js';
import { useState, useEffect, useCallback } from 'react';
import { TradeExact } from '../lib/types';
import { DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY } from '../lib/currencies';
import { getRate } from '../lib/exchange';
import { useDebounce } from './utils';
import { useBalance } from './balance';
import { logError } from '../lib/log';
import { isNotZero } from '../lib/numbers';

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
const HIGH_OUTPUT_AMOUNT = 5000;

let nonce = 0;

export function useRate(initialRequest) {
  const [rateForm, setRateForm] = useState(() => defaultRateForm(initialRequest));
  const [rateRequest, setRateRequest] = useState(null);
  const { balance } = useBalance(rateForm.values.inputCurrency);

  useEffect(() => {
    setRateForm(defaultRateForm(initialRequest));
  }, [initialRequest]);

  const estimate = useCallback(async (_rateForm, _balance, _nonce) => {
    if(!_rateForm.loading) return;

    const currentRequest = {
      inputCurrency: _rateForm.values.inputCurrency,
      outputCurrency: _rateForm.values.outputCurrency,
      tradeExact: _rateForm.values.tradeExact,
      amount: _rateForm.values.tradeExact === TradeExact.INPUT ? _rateForm.values.inputAmount : _rateForm.values.outputAmount,
    };

    if(!isNotZero(currentRequest.amount)) {
      setRateForm(r => ({
        ...r,
        loading: false,
        errors: {
          lowAmount: true,
        },
      }));
      return;
    }

    if(_balance !== null && currentRequest.tradeExact === TradeExact.INPUT && new BN(currentRequest.amount).gt(_balance)) {
      setRateForm(r => ({
        ...r,
        loading: false,
        errors: {
          lowBalance: true,
        },
      }));
      return;
    } else if(currentRequest.tradeExact === TradeExact.OUTPUT) {
      if(new BN(currentRequest.amount).lt(LOW_OUTPUT_AMOUNT)) {
        setRateForm(r => ({
          ...r,
          loading: false,
          errors: {
            lowAmount: true,
          },
        }));
        return;
      }
      if(new BN(currentRequest.amount).gt(HIGH_OUTPUT_AMOUNT)) {
        setRateForm(r => ({
          ...r,
          loading: false,
          errors: {
            highAmount: true,
          },
        }));
        return;
      }
    }

    const res = await getRate(currentRequest);

    if(_nonce !== nonce) {
      return;
    }

    const updateRateForm = {
      loading: false,
      values: {
        fees: res.fees,
      },
      errors: null,
    };
    if(currentRequest.tradeExact === TradeExact.INPUT) {
      updateRateForm.values.outputAmount = new BN(res.outputAmount).toFixed();
      if(new BN(res.outputAmount).lt(LOW_OUTPUT_AMOUNT)) {
        updateRateForm.errors = { lowAmount: true };
      }
      if(new BN(res.outputAmount).gt(HIGH_OUTPUT_AMOUNT)) {
        updateRateForm.errors = { highAmount: true };
      }
    }
    else if(currentRequest.tradeExact === TradeExact.OUTPUT) {
      updateRateForm.values.inputAmount = new BN(res.inputAmount).toFixed();
      if(_balance !== null && new BN(res.inputAmount).gt(_balance)) {
        updateRateForm.errors = { lowBalance: true };
      }
    }

    setRateForm(r => ({
      ...r,
      ...updateRateForm,
      values: {
        ...r.values,
        ...updateRateForm.values,
      },
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
        [currencyKey]: currency,
        [r.values.tradeExact === TradeExact.INPUT ? 'outputAmount' : 'inputAmount']: null,
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
    nonce++;
    estimate(debouncedRateForm, balance, nonce).catch(error => {
      logError('unable to fetch rates', error);
    });
  }, [debouncedRateForm, balance, estimate]);
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
    HIGH_OUTPUT_AMOUNT,
  };
}
