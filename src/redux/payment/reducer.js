import { INPUT_CURRENCIES, OUTPUT_CURRENCIES } from '../../lib/currencies';

import * as actions from "./actions";

export const STATE_NAME = 'PAYMENT';

const initialEmptyState = {
  paymentRequest: {
    recipient: null,
    contactPerson: null,
    amountDetail: {
      inputCurrency: INPUT_CURRENCIES[0],
      outputCurrency: OUTPUT_CURRENCIES[0],
      amount: 100,
      tradeExact: 'OUTPUT',
    },
    reference: '',
  },
  paymentOrder: null,
  orderError: null,
  tokenExchange: null,
  paymentStatus: null,
  paymentTransaction: null,
};

const initialState = initialEmptyState;
// const initialState = initialMockState;

export default function(state = initialState, action) {
  switch (action.type) {
    case actions.SET_AMOUNT_DETAIL: {
      const { amountDetail } = action.payload;
      return {
        ...state,
        paymentRequest: {
          ...state.paymentRequest,
          amountDetail,
        },
      };
    }
    case actions.SET_RECIPIENT: {
      const { recipient } = action.payload;
      return {
        ...state,
        paymentRequest: {
          ...state.paymentRequest,
          recipient,
        },
      };
    }
    case actions.SET_CONTACT_PERSON: {
      const { contactPerson } = action.payload;
      return {
        ...state,
        paymentRequest: {
          ...state.paymentRequest,
          contactPerson,
        },
      };
    }
    case actions.SET_REFERENCE: {
      const { reference } = action.payload;
      return {
        ...state,
        paymentRequest: {
          ...state.paymentRequest,
          reference,
        },
      };
    }
    case actions.SET_PAYMENT_ORDER: {
      const { paymentOrder } = action.payload;
      return {
        ...state,
        paymentOrder,
      };
    }
    case actions.SET_ORDER_ERRORS: {
      const { orderErrors } = action.payload;
      return {
        ...state,
        orderErrors,
      };
    }
    case actions.SET_TOKEN_EXCHANGE: {
      const { tokenExchange } = action.payload;
      return {
        ...state,
        tokenExchange,
      };
    }
    case actions.RESET_ORDER: {
      return {
        ...state,
        paymentOrder: null,
        orderError: null,
      };
    }
    case actions.SET_PAYMENT_STATUS: {
      const { paymentStatus } = action.payload;
      return {
        ...state,
        paymentStatus,
      };
    }
    case actions.SET_PAYMENT_TRANSACTION: {
      const { transaction } = action.payload;
      return {
        ...state,
        transaction,
      };
    }
    default:
      return state;
  }
}
