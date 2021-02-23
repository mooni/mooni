import { useReducer, useEffect, useCallback } from 'react';
import { MultiTradeEstimation, TradeExact } from '../lib/trading/types';
import { useDebounce } from './utils';
import { logError } from '../lib/log';
import { isNotZero, BN, truncateNumber } from '../lib/numbers';
import { TradeRequest } from "../lib/trading/types";
import Api from "../lib/apiWrapper";
import {BityOrderError} from "../lib/wrappers/bityTypes";
import { APIError } from '../lib/errors';
import { useCurrenciesContext } from './currencies';

import { dailyLimits } from '../constants/limits';

interface RateForm {
  loading: boolean,
  errors: {
    zeroAmount?: boolean
    lowAmount?: string
    highAmount?: boolean
    lowLiquidity?: boolean
    failed?: boolean
  } | null,
  values: {
    inputCurrency: string,
    outputCurrency: string,
    inputAmount: string | null,
    outputAmount: string | null,
    tradeExact: TradeExact,
  },
  connected: boolean,
}

interface RateState {
  rateForm: RateForm;
  tradeRequest: TradeRequest;
  multiTradeEstimation: MultiTradeEstimation | null;
}

function defaultRateState(initialTradeRequest: TradeRequest): RateState {
  let values = {
    inputCurrency: initialTradeRequest.inputCurrencyObject.symbol,
    outputCurrency: initialTradeRequest.outputCurrencyObject.symbol,
    inputAmount: initialTradeRequest.tradeExact === TradeExact.INPUT ? initialTradeRequest.amount : null,
    outputAmount: initialTradeRequest.tradeExact === TradeExact.OUTPUT ? initialTradeRequest.amount : null,
    tradeExact: initialTradeRequest.tradeExact,
  };

  return {
    rateForm: {
      loading: true,
      errors: null,
      values,
      connected: false,
    },
    tradeRequest: initialTradeRequest,
    multiTradeEstimation: null,
  };
}

let nonce = 0;

interface RateResponse {
  rateForm: RateForm,
  tradeRequest: TradeRequest,
  multiTradeEstimation: MultiTradeEstimation | null,
  onChangeCurrency: any,
  onChangeAmount: any,
}

interface RateStateAction {
  type: string;
  payload?: any;
}

type RateStateReducer = (RateState, RateStateAction) => RateState;

function correctAmount(amount: string, decimals: number) {
  if(amount === '') return '0';
  const truncAmount = truncateNumber(amount, decimals);
  if(new BN(amount).eq(truncAmount)) {
    return amount;
  } else {
    return truncAmount;
  }
}

const rateStateReducer: RateStateReducer = (state: RateState, action: RateStateAction) => {
  switch (action.type) {
    case 'init': {
      return defaultRateState(action.payload);
    }
    case 'setCurrency': {
      const {tradeExact, currencyObject} = action.payload;
      const currencyKey = tradeExact === TradeExact.INPUT ? 'inputCurrency':'outputCurrency';
      const currencyObjectKey = tradeExact === TradeExact.INPUT ? 'inputCurrencyObject':'outputCurrencyObject';

      const tradeRequest: TradeRequest = {
        ...state.tradeRequest,
        [currencyObjectKey]: currencyObject,
      };

      return {
        ...state,
        rateForm: {
          ...state.rateForm,
          loading: true,
          errors: null,
          values: {
            ...state.rateForm.values,
            [currencyKey]: currencyObject.symbol,
            [state.rateForm.values.tradeExact===TradeExact.INPUT ? 'outputAmount':'inputAmount']: null,
          }
        },
        tradeRequest,
        multiTradeEstimation: null,
      };
    }
    case 'setAmount': {
      const {tradeExact, amount} = action.payload;
      const currencyObject = tradeExact === TradeExact.INPUT ? state.tradeRequest.inputCurrencyObject: state.tradeRequest.outputCurrencyObject;
      const correctedAmount = correctAmount(amount, currencyObject.decimals);

      const tradeRequest: TradeRequest = {
        ...state.tradeRequest,
        tradeExact,
        amount: correctedAmount,
      };

      return {
        ...state,
        rateForm: {
          ...state.rateForm,
          loading: true,
          errors: null,
          values: {
            ...state.rateForm.values,
            tradeExact,
            inputAmount: tradeExact===TradeExact.INPUT ? correctedAmount : null,
            outputAmount: tradeExact===TradeExact.OUTPUT ? correctedAmount : null,
          }
        },
        tradeRequest,
        multiTradeEstimation: null,
      };
    }
    case 'setError': {
      const setValues: any = {};
      if(action.payload.errors.highAmount) {
        setValues.outputAmount = action.payload.outputAmount
      }
      return {
        ...state,
        rateForm: {
          ...state.rateForm,
          loading: false,
          errors: action.payload.errors,
          values: {
            ...state.rateForm.values,
            ...setValues,
          }
        }
      };
    }
    case 'setEstimation': {
      const multiTradeEstimation: MultiTradeEstimation = action.payload.multiTradeEstimation;

      const tradeExact = multiTradeEstimation.tradeRequest.tradeExact;

      const amountKey = tradeExact === TradeExact.INPUT ? 'outputAmount':'inputAmount';
      const amount = tradeExact === TradeExact.INPUT ? multiTradeEstimation.outputAmount : multiTradeEstimation.inputAmount;

      return {
        ...state,
        rateForm: {
          ...state.rateForm,
          loading: false,
          errors: null,
          values: {
            ...state.rateForm.values,
            [amountKey]: amount,
          }
        },
        multiTradeEstimation,
      };
    }
    case 'noop': {
      return state;
    }
    default:
      throw new Error();
  }
}

const estimate = async (tradeRequest: TradeRequest, _nonce: number): Promise<RateStateAction> => {
  const outputLimit = dailyLimits[tradeRequest.outputCurrencyObject.symbol];

  if(!isNotZero(tradeRequest.amount)) {
    return {
      type: 'setError',
      payload: {
        errors: {
          zeroAmount: true,
        },
      }
    };
  }

  if(tradeRequest.tradeExact === TradeExact.OUTPUT) {
    if(new BN(tradeRequest.amount).gt(outputLimit)) {
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
    multiTradeEstimation = await Api.estimateMultiTrade(tradeRequest);
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

  if(tradeRequest.tradeExact === TradeExact.INPUT && new BN(multiTradeEstimation.outputAmount).gt(outputLimit)) {
    return {
      type: 'setError',
      payload: {
        errors: {
          highAmount: true,
        },
        outputAmount: multiTradeEstimation.outputAmount,
      }
    }
  }
  return {
    type: 'setEstimation',
    payload: {
      multiTradeEstimation,
    }
  }
};

export function useRate(initialTradeRequest: TradeRequest): RateResponse {
  const { getCurrency } = useCurrenciesContext();
  const [rateState, dispatchRateState] = useReducer<RateStateReducer, TradeRequest>(rateStateReducer, initialTradeRequest, defaultRateState);

  useEffect(() => {
    dispatchRateState({ type: 'init', payload: initialTradeRequest });
  }, [initialTradeRequest]);

  const onChangeCurrency = useCallback(tradeExact => currencySymbol => {
    dispatchRateState({
      type: 'setCurrency',
      payload: {
        tradeExact,
        currencyObject: getCurrency(currencySymbol).toObject(),
      }
    });
  }, [getCurrency]);

  const onChangeAmount = useCallback(tradeExact => value => {
    dispatchRateState({
      type: 'setAmount',
      payload: {
        tradeExact,
        amount: value,
      }
    });
  }, []);

  const debouncedRateRequest = useDebounce(rateState.tradeRequest, 1000);
  useEffect(() => {
    nonce++;
    estimate(debouncedRateRequest, nonce)
      .then(dispatchRateState)
      .catch(error => {
        logError('unexpected error while fetching rates', error);
      });
  }, [debouncedRateRequest]);

  return {
    rateForm: rateState.rateForm,
    tradeRequest: rateState.tradeRequest,
    multiTradeEstimation: rateState.multiTradeEstimation,
    onChangeCurrency,
    onChangeAmount,
  };
}
