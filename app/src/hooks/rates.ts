import { useState, useEffect, useCallback } from 'react';
import { TradeExact } from '../lib/types';
import { DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY, getCurrency } from '../lib/trading/currencies';
import { useDebounce } from './utils';
import { useBalance } from './balance';
import { logError } from '../lib/log';
import {isNotZero, BN} from '../lib/numbers';
import {TradeRequest} from "../lib/trading/types";
import {estimateMultiTrade} from "../lib/trading/trader";

interface RateForm {
  loading: boolean,
  errors?: {
    lowBalance?: boolean
    lowAmount?: boolean
    highAmount?: boolean
  },
  values: {
    inputCurrency: string,
    outputCurrency: string,
    inputAmount: string,
    outputAmount: string,
    tradeExact: TradeExact,
    fees?: { amount: string, currency: string } // TODO
  },
}

function defaultRateForm(initialRequest): RateForm {
  let values = initialRequest ?
    {
      inputCurrency: initialRequest.inputCurrency.symbol,
      outputCurrency: initialRequest.outputCurrency.symbol,
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
    };

  return {
    loading: true,
    errors: undefined,
    values,
  };
}

const LOW_OUTPUT_AMOUNT = 15;
const HIGH_OUTPUT_AMOUNT = 5000;

let nonce = 0;

export function useRate(initialTradeRequest: TradeRequest) {
  const [rateForm, setRateForm] = useState<RateForm>(() => defaultRateForm(initialTradeRequest));
  const [tradeRequest, setTradeRequest] = useState<TradeRequest|null>(null);
  const { balance } = useBalance(rateForm.values.inputCurrency);


  useEffect(() => {
    setRateForm(defaultRateForm(initialTradeRequest));
  }, [initialTradeRequest]);

  const estimate = useCallback(async (_rateForm, _balance, _nonce) => {
    if(!_rateForm.loading) return;

    const currentRequest: TradeRequest = {
      inputCurrency: getCurrency(_rateForm.values.inputCurrency),
      outputCurrency: getCurrency(_rateForm.values.outputCurrency),
      tradeExact: _rateForm.values.tradeExact as TradeExact,
      amount: _rateForm.values.tradeExact as TradeExact === TradeExact.INPUT ? _rateForm.values.inputAmount : _rateForm.values.outputAmount,
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
      else if(new BN(currentRequest.amount).gt(HIGH_OUTPUT_AMOUNT)) {
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

    const multiTrade = await estimateMultiTrade({
      tradeRequest: currentRequest,
    });

    if(_nonce !== nonce) {
      return;
    }

    const updateRateForm: any = {
      loading: false,
      values: {
        fees: {amount: '1', currency: 'ETH' } // TODO
      },
      errors: null,
    };
    if(currentRequest.tradeExact === TradeExact.INPUT) {
      updateRateForm.values.outputAmount = new BN(multiTrade.outputAmount).toFixed();
      if(new BN(multiTrade.outputAmount).lt(LOW_OUTPUT_AMOUNT)) {
        updateRateForm.errors = { lowAmount: true };
      }
      else if(new BN(multiTrade.outputAmount).gt(HIGH_OUTPUT_AMOUNT)) {
        updateRateForm.errors = { highAmount: true };
      }
    }
    else if(currentRequest.tradeExact === TradeExact.OUTPUT) {
      updateRateForm.values.inputAmount = new BN(multiTrade.inputAmount).toFixed();
      if(_balance !== null && new BN(multiTrade.inputAmount).gt(_balance)) {
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
      setTradeRequest(currentRequest);
    } else {
      setTradeRequest(null);
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
    tradeRequest,
    onChangeCurrency,
    onChangeAmount,
    LOW_OUTPUT_AMOUNT,
    HIGH_OUTPUT_AMOUNT,
  };
}
