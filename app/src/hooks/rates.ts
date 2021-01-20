import { useState, useEffect, useCallback } from 'react';
import {MultiTradeEstimation, TradeExact} from '../lib/trading/types';
import { DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY } from '../lib/trading/currencyList';
import { useSelector } from 'react-redux';
import { useDebounce } from './utils';
import { BalanceData, useBalance } from './balance';
import { logError } from '../lib/log';
import {isNotZero, BN} from '../lib/numbers';
import { TradeRequest } from "../lib/trading/types";
import Api from "../lib/apiWrapper";
import config from "../config";
import {BityOrderError} from "../lib/wrappers/bityTypes";
import { APIError } from '../lib/errors';
import { getETHManager } from '../redux/wallet/selectors';

interface RateForm {
  loading: boolean,
  errors?: {
    lowBalance?: boolean
    zeroAmount?: boolean
    lowAmount?: string
    highAmount?: boolean
    lowLiquidity?: boolean
    failed?: boolean
  },
  values: {
    inputCurrency: string,
    outputCurrency: string,
    inputAmount: string,
    outputAmount: string,
    tradeExact: TradeExact,
  },
  balanceData: BalanceData,
  connected: boolean,
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
    balanceData: {
      balance: '0',
      balanceLoading: false,
    },
    connected: false,
  };
}

let nonce = 0;

interface RateResponse {
  rateForm: RateForm,
  tradeRequest: TradeRequest,
  multiTradeEstimation: MultiTradeEstimation | null,
  onChangeCurrency: any, // TODO
  onChangeAmount: any,
}

export function useRate(initialTradeRequest: TradeRequest): RateResponse {
  const ethManager = useSelector(getETHManager);
  const [rateForm, setRateForm] = useState<RateForm>(() => defaultRateForm(initialTradeRequest));
  const [tradeRequest, setTradeRequest] = useState<TradeRequest>(initialTradeRequest);
  const [multiTradeEstimation, setMultiTradeEstimation] = useState<MultiTradeEstimation|null>(null);
  const { balanceLoading, balance } = useBalance(rateForm.values.inputCurrency);

  useEffect(() => {
    setRateForm(defaultRateForm(initialTradeRequest));
  }, [initialTradeRequest]);

  const estimate = useCallback(async (_rateForm: RateForm, _nonce: number) => {
    if(!_rateForm.loading) return;
    if(_rateForm.connected && _rateForm.balanceData.balanceLoading) return;

    const currentRequest: TradeRequest = {
      inputCurrencySymbol: _rateForm.values.inputCurrency,
      outputCurrencySymbol: _rateForm.values.outputCurrency,
      tradeExact: _rateForm.values.tradeExact as TradeExact,
      amount: _rateForm.values.tradeExact as TradeExact === TradeExact.INPUT ? _rateForm.values.inputAmount : _rateForm.values.outputAmount,
    };
    setMultiTradeEstimation(null);

    if(!isNotZero(currentRequest.amount)) {
      setRateForm(r => ({
        ...r,
        loading: false,
        errors: {
          zeroAmount: true,
        },
      }));
      return;
    }

    if(_rateForm.connected && currentRequest.tradeExact === TradeExact.INPUT && new BN(currentRequest.amount).gt(_rateForm.balanceData.balance)) {
      setRateForm(r => ({
        ...r,
        loading: false,
        errors: {
          lowBalance: true,
        },
      }));
      return;
    } else if(currentRequest.tradeExact === TradeExact.OUTPUT) {
      if(new BN(currentRequest.amount).gt(config.maxOutputAmount)) {
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
        return;
      } else if(error instanceof APIError && error.message === 'dex-liquidity-error') {
        setRateForm(r => ({
          ...r,
          loading: false,
          errors: {
            lowLiquidity: true,
          },
        }));
        return;
      } else {
        logError('api error while fetching rates', error);
        setRateForm(r => ({
          ...r,
          loading: false,
          errors: {
            failed: true,
          },
        }));
        return;
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
      if(new BN(multiTradeEstimation.outputAmount).gt(config.maxOutputAmount)) {
        updateRateForm.errors = { highAmount: true };
      }
    }
    else if(currentRequest.tradeExact === TradeExact.OUTPUT) {
      updateRateForm.values.inputAmount = new BN(multiTradeEstimation.inputAmount).toFixed();
      if(_rateForm.connected && new BN(multiTradeEstimation.inputAmount).gt(_rateForm.balanceData.balance)) {
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
    estimate(debouncedRateForm, nonce).catch(error => {
      logError('unexpected error while fetching rates', error);
    });
  }, [debouncedRateForm, estimate]);

  useEffect(() => {
    setRateForm(r => ({
      ...r,
      loading: true,
      balanceData: { balanceLoading, balance },
      connected: !!ethManager,
    }));
  }, [balanceLoading, ethManager, balance]);

  return {
    rateForm,
    tradeRequest,
    multiTradeEstimation,
    onChangeCurrency,
    onChangeAmount,
  };
}
