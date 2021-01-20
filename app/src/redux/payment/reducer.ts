import {
  OrderErrors,
  Payment,
  PaymentStatus,
  PaymentStep,
  Recipient,
} from '../../lib/types';

import { STATE_NAME, PaymentState, initialState } from "./state";
import * as actions from './actions';
import { BankInfo, CurrencySymbol, MultiTrade, MultiTradeRequest, TradeRequest } from '../../lib/trading/types';

export { STATE_NAME };

export default function(state : PaymentState = initialState, action: { type: string, payload?: any }): PaymentState {
  switch (action.type) {
    case actions.SET_TRADE_REQUEST: {
      const { tradeRequest }: { tradeRequest: TradeRequest } = action.payload;

      return {
        ...state,
        multiTradeRequest: {
          ...(state.multiTradeRequest as MultiTradeRequest),
          tradeRequest,
        },
      };
    }
    case actions.SET_INPUT_CURRENCY: {
      const { symbol }: { symbol: CurrencySymbol } = action.payload;

      return {
        ...state,
        multiTradeRequest: {
          ...(state.multiTradeRequest as MultiTradeRequest),
          tradeRequest: {
            ...(state.multiTradeRequest.tradeRequest as TradeRequest),
            inputCurrencySymbol: symbol,
          },
        },
      };
    }
    case actions.SET_RECIPIENT: {
      const { recipient }: { recipient: Recipient } = action.payload;
      return {
        ...state,
        multiTradeRequest: {
          ...(state.multiTradeRequest as MultiTradeRequest),
          bankInfo: {
            ...state.multiTradeRequest?.bankInfo,
            recipient,
          },
        },
      };
    }
    case actions.SET_REFERENCE: {
      const { reference }: { reference: string } = action.payload;
      return {
        ...state,
        multiTradeRequest: {
          ...(state.multiTradeRequest as MultiTradeRequest),
          bankInfo: {
            ...(state.multiTradeRequest?.bankInfo as BankInfo),
            reference,
          },
        },
      };
    }
    case actions.SET_REFERRAL: {
      const { referralId }: { referralId: string } = action.payload;
      return {
        ...state,
        multiTradeRequest: {
          ...(state.multiTradeRequest as MultiTradeRequest),
          referralId,
        },
      };
    }
    case actions.SET_MULTITRADE: {
      const { multiTrade }: { multiTrade: MultiTrade } = action.payload;
      return {
        ...state,
        multiTrade,
      };
    }
    case actions.SET_ORDER_ERRORS: {
      const { orderErrors }: { orderErrors: OrderErrors } = action.payload;
      return {
        ...state,
        orderErrors,
      };
    }
    case actions.RESET_ORDER: {
      return {
        ...state,
        multiTrade: null,
        orderErrors: null,
      };
    }
    case actions.SET_EXCHANGE_STEP: {
      const { stepId }: { stepId: number } = action.payload;
      return {
        ...state,
        exchangeStep: stepId,
      };
    }
    case actions.RESET_PAYMENT: {
      return {
        ...state,
        payment: null,
      };
    }
    case actions.SET_PAYMENT: {
      const { payment }: { payment: Payment } = action.payload;
      return {
        ...state,
        payment,
      };
    }
    case actions.UPDATE_PAYMENT_STEP: {
      const { paymentStepUpdate }: { paymentStepUpdate: PaymentStep } = action.payload;

      if(!state.payment) throw new Error('Cannot update payment step on undefined');

      const stepIndex = state.payment.steps.findIndex(s => s.id === paymentStepUpdate.id);
      if(stepIndex === -1) throw new Error('payment step not found');

      const newState = Object.assign({}, state);
      newState.payment = Object.assign({}, state.payment);
      newState.payment.steps = state.payment.steps.map((s,i) =>
          i === stepIndex ? Object.assign({}, s, paymentStepUpdate) : s
      );

      return newState;
    }
    case actions.SET_PAYMENT_STATUS: {
      const { status }: { status: PaymentStatus } = action.payload;

      if(!state.payment) throw new Error('Cannot update payment status on undefined');

      const newState = Object.assign({}, state);
      newState.payment = Object.assign({}, state.payment);
      newState.payment.status = status;

      return newState;
    }
    default:
      return state;
  }
}
