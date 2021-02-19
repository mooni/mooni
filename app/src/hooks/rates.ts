import { useState, useReducer, useEffect, useCallback } from 'react';
import {MultiTradeEstimation, TradeExact} from '../lib/trading/types';
import { DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY } from '../lib/trading/currencyList';
import { useDebounce } from './utils';
import { logError } from '../lib/log';
import {isNotZero, BN} from '../lib/numbers';
import { TradeRequest } from "../lib/trading/types";
import Api from "../lib/apiWrapper";
import {BityOrderError} from "../lib/wrappers/bityTypes";
import { APIError } from '../lib/errors';
import { GetCurrencyFn } from '../contexts/CurrenciesContext';
import { useCurrenciesContext } from './currencies';

import { dailyLimits } from '../constants/limits';

interface RateForm {
  loading: boolean,
  errors: {
    lowBalance?: boolean
    zeroAmount?: boolean
    lowAmount?: string
    highAmount?: boolean
    lowLiquidity?: boolean
    failed?: boolean
  } | null,
  values: {
    inputCurrency: string,
    outputCurrency: string,
    inputAmount: string,
    outputAmount: string,
    tradeExact: TradeExact,
  },
  connected: boolean,
}

function defaultRateForm(initialRequest): RateForm {
  let values = initialRequest ?
    {
      inputCurrency: initialRequest.inputCurrencyObject.symbol,
      outputCurrency: initialRequest.outputCurrencyObject.symbol,
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
    errors: null,
    values,
    connected: false,
  };
}

let nonce = 0;

interface RateResponse {
  rateForm: RateForm,
  tradeRequest: TradeRequest | null,
  multiTradeEstimation: MultiTradeEstimation | null,
  onChangeCurrency: any,
  onChangeAmount: any,
}

interface RateFormAction {
  type: string;
  payload?: any;
}

type RateFormReducer = (RateForm, RateFormAction) => RateForm;

const rateFormReducer: RateFormReducer = (state: RateForm, action: RateFormAction) => {
  switch (action.type) {
    case 'init': {
      return defaultRateForm(action.payload);
    }
    case 'setCurrency': {
      const {tradeExact, currency} = action.payload;
      const currencyKey = tradeExact === TradeExact.INPUT ? 'inputCurrency':'outputCurrency';

      return {
        ...state,
        loading: true,
        errors: null,
        values: {
          ...state.values,
          [currencyKey]: currency,
          [state.values.tradeExact===TradeExact.INPUT ? 'outputAmount':'inputAmount']: null,
        }
      };
    }
    case 'setAmount': {
      const {tradeExact, amount} = action.payload;

      return {
        ...state,
        loading: true,
        errors: null,
        values: {
          ...state.values,
          tradeExact,
          inputAmount: tradeExact === TradeExact.INPUT ? amount : null,
          outputAmount: tradeExact === TradeExact.OUTPUT ? amount : null,
        }
      };
    }
    case 'setError': {
      return {
        ...state,
        loading: false,
        errors: action.payload.errors,
      };
    }
    case 'setEstimation': {
      const multiTradeEstimation: MultiTradeEstimation = action.payload.multiTradeEstimation;

      const tradeExact = multiTradeEstimation.tradeRequest.tradeExact;

      const amountKey = tradeExact === TradeExact.INPUT ? 'outputAmount':'inputAmount';
      const amount = tradeExact === TradeExact.INPUT ? multiTradeEstimation.outputAmount : multiTradeEstimation.inputAmount;

      return {
        ...state,
        loading: false,
        errors: null,
        values: {
          ...state.values,
          [amountKey]: amount,
        }
      };
    }
    case 'noop': {
      return state;
    }
    default:
      throw new Error();
  }
}

const estimate = async (_rateForm: RateForm, _nonce: number, _getCurrency: GetCurrencyFn): Promise<RateFormAction> => {
  const outputLimit = dailyLimits[_rateForm.values.outputCurrency];

  const currentRequest: TradeRequest = {
    inputCurrencyObject: _getCurrency(_rateForm.values.inputCurrency).toObject(),
    outputCurrencyObject: _getCurrency(_rateForm.values.outputCurrency).toObject(),
    tradeExact: _rateForm.values.tradeExact,
    amount: _rateForm.values.tradeExact === TradeExact.INPUT ? _rateForm.values.inputAmount : _rateForm.values.outputAmount,
  };

  if(!isNotZero(currentRequest.amount)) {
    return {
      type: 'setError',
      payload: {
        errors: {
          zeroAmount: true,
        },
      }
    };
  }

  if(currentRequest.tradeExact === TradeExact.OUTPUT) {
    if(new BN(currentRequest.amount).gt(outputLimit)) {
      return {
        type: 'setError',
        payload: {
          errors: {
            highAmount: true,
          },
        }
      };
    }
  }

  let multiTradeEstimation: MultiTradeEstimation;
  try {
    multiTradeEstimation = await Api.estimateMultiTrade(currentRequest);
  } catch(error) {
    if(error instanceof BityOrderError && error.message === 'bity_amount_too_low') {
      const bityOrderError = error as BityOrderError;
      return {
        type: 'setError',
        payload: {
          errors: {
            lowAmount: bityOrderError.meta.errors[0].minimumOutputAmount,
          },
        }
      };
    } else if(error instanceof APIError && error.message === 'dex-liquidity-error') {
      return {
        type: 'setError',
        payload: {
          errors: {
            lowLiquidity: true,
          },
        }
      };
    } else {
      logError('api error while fetching rates', error);
      return {
        type: 'setError',
        payload: {
          errors: {
            failed: true,
          },
        }
      };
    }
  }

  if(_nonce !== nonce) {
    return {type: 'noop'};
  }

  if(currentRequest.tradeExact === TradeExact.INPUT && new BN(multiTradeEstimation.outputAmount).gt(outputLimit)) {
    return {
      type: 'setError',
      payload: {
        errors: {
          highAmount: true, // TODO set outputamount
        },
      }
    }
  }
  return {
    type: 'setEstimation',
    payload: {
      multiTradeEstimation,
      tradeRequest: currentRequest,
    }
  }
};

export function useRate(initialTradeRequest: TradeRequest): RateResponse {
  const [tradeRequest, setTradeRequest] = useState<TradeRequest | null>(initialTradeRequest);
  const [multiTradeEstimation, setMultiTradeEstimation] = useState<MultiTradeEstimation|null>(null);
  const { getCurrency } = useCurrenciesContext();

  const [rateForm, dispatchRateForm] = useReducer<RateFormReducer, TradeRequest>(rateFormReducer, initialTradeRequest, defaultRateForm);

  useEffect(() => {
    dispatchRateForm({ type: 'init', payload: initialTradeRequest });
  }, [initialTradeRequest]);

  const onChangeCurrency = useCallback(tradeExact => currency => {
    dispatchRateForm({
      type: 'setCurrency',
      payload: {
        tradeExact,
        currency,
      }
    });
  },[]);

  const onChangeAmount = useCallback(tradeExact => e => {
    dispatchRateForm({
      type: 'setAmount',
      payload: {
        tradeExact,
        amount: e.target.value,
      }
    });
  }, []);

  const debouncedRateForm = useDebounce(rateForm, 1000);
  useEffect(() => {
    if(!debouncedRateForm.loading) return;

    nonce++;
    setTradeRequest(null);
    setMultiTradeEstimation(null);

    estimate(debouncedRateForm, nonce, getCurrency)
      .then((action: RateFormAction) => {
        dispatchRateForm(action);
        if(action.type === 'setEstimation') {
          setMultiTradeEstimation(action.payload.multiTradeEstimation);
          setTradeRequest(action.payload.tradeRequest);
        }
      })
      .catch(error => {
        logError('unexpected error while fetching rates', error);
      });
  }, [debouncedRateForm, getCurrency]);

  return {
    rateForm,
    tradeRequest,
    multiTradeEstimation,
    onChangeCurrency,
    onChangeAmount,
  };
}
