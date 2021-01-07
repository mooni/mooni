import { useState, useEffect, useCallback } from 'react';
import {MultiTradeEstimation, TradeExact} from '../lib/trading/types';
import { DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY } from '../lib/trading/currencyList';
import { useDebounce } from './utils';
import { useBalance } from './balance';
import { logError } from '../lib/log';
import {isNotZero, BN} from '../lib/numbers';
import { TradeRequest } from "../lib/trading/types";
import Api from "../lib/api";
import {BityOrderError} from "../lib/wrappers/bityTypes";

interface RateForm {
  loading: boolean,
  errors?: {
    lowBalance?: boolean
    zeroAmount?: boolean
    lowAmount?: string
    highAmount?: boolean
  },
  values: {
    inputCurrency: string,
    outputCurrency: string,
    inputAmount: string,
    outputAmount: string,
    tradeExact: TradeExact,
  },
}

function defaultRateForm(initialRequest): RateForm {
  let values = initialRequest ?
    {
      inputCurrency: initialRequest.inputCurrencySymbol,
      outputCurrency: initialRequest.outputCurrencySymbol,
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

const HIGH_OUTPUT_AMOUNT: number = 5000;

let nonce = 0;

interface RateResponse {
  rateForm: RateForm,
  tradeRequest: TradeRequest,
  multiTradeEstimation: MultiTradeEstimation | null,
  onChangeCurrency: any, // TODO
  onChangeAmount: any,
  HIGH_OUTPUT_AMOUNT: number,
}

export function useRate(initialTradeRequest: TradeRequest): RateResponse {
  const [rateForm, setRateForm] = useState<RateForm>(() => defaultRateForm(initialTradeRequest));
  const [tradeRequest, setTradeRequest] = useState<TradeRequest>(initialTradeRequest);
  const [multiTradeEstimation, setMultiTradeEstimation] = useState<MultiTradeEstimation|null>(null);
  const { balance } = useBalance(rateForm.values.inputCurrency);

  useEffect(() => {
    setRateForm(defaultRateForm(initialTradeRequest));
  }, [initialTradeRequest]);

  const estimate = useCallback(async (_rateForm, _balance, _nonce) => {
    if(!_rateForm.loading) return;

    const currentRequest: TradeRequest = {
      inputCurrencySymbol: _rateForm.values.inputCurrency,
      outputCurrencySymbol: _rateForm.values.outputCurrency,
      tradeExact: _rateForm.values.tradeExact as TradeExact,
      amount: _rateForm.values.tradeExact as TradeExact === TradeExact.INPUT ? _rateForm.values.inputAmount : _rateForm.values.outputAmount,
    };

    if(!isNotZero(currentRequest.amount)) {
      setRateForm(r => ({
        ...r,
        loading: false,
        errors: {
          zeroAmount: true,
        },
      }));
      setMultiTradeEstimation(null);
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
      setMultiTradeEstimation(null);
      return;
    } else if(currentRequest.tradeExact === TradeExact.OUTPUT) {
      if(new BN(currentRequest.amount).gt(HIGH_OUTPUT_AMOUNT)) {
        setRateForm(r => ({
          ...r,
          loading: false,
          errors: {
            highAmount: true,
          },
        }));
        setMultiTradeEstimation(null);
        return;
      }
    }

    let multiTradeEstimation: MultiTradeEstimation;
    try {
      multiTradeEstimation = await Api.estimateMultiTrade(currentRequest);
    } catch(error) {
      if(error instanceof BityOrderError && error.message === 'bity_amount_too_low') {
        const bityOrderError = error as BityOrderError;
        setRateForm(r => ({
          ...r,
          loading: false,
          errors: {
            lowAmount: bityOrderError.meta.errors[0].minimumOutputAmount,
          },
        }));
        setMultiTradeEstimation(null);
        return;
      } else {
        throw error;
      }
    }

    if(_nonce !== nonce) {
      return;
    }

    const updateRateForm: any = {
      loading: false,
      errors: null,
      values: {},
    };
    if(currentRequest.tradeExact === TradeExact.INPUT) {
      updateRateForm.values.outputAmount = new BN(multiTradeEstimation.outputAmount).toFixed();
      if(new BN(multiTradeEstimation.outputAmount).gt(HIGH_OUTPUT_AMOUNT)) {
        updateRateForm.errors = { highAmount: true };
      }
    }
    else if(currentRequest.tradeExact === TradeExact.OUTPUT) {
      updateRateForm.values.inputAmount = new BN(multiTradeEstimation.inputAmount).toFixed();
      if(_balance !== null && new BN(multiTradeEstimation.inputAmount).gt(_balance)) {
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
      setMultiTradeEstimation(multiTradeEstimation);
    } else {
      setMultiTradeEstimation(null);
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
    multiTradeEstimation,
    onChangeCurrency,
    onChangeAmount,
    HIGH_OUTPUT_AMOUNT,
  };
}
