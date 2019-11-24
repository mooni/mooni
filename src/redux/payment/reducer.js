import { OUTPUT_CURRENCIES } from '../../lib/currencies';

import * as actions from "./actions";

export const STATE_NAME = 'PAYMENT';

/*
const exampleRecipient = {
  owner: {
    name: 'Alice Martin',
    address: '5 Rue de Rivoli',
    zip: '75001',
    city: 'Paris',
    country: 'FR',
  },
  iban: 'FR7630004000031234567890143',
  bic_swift: 'BNPAFRPP',
};
const examplePaymentDetail = {
  outputCurrency: 'EUR',
  outputAmount: 100,
  reference: 'Bill 123',
};
*/

const initialState = {
  inputCurrency: null,
  paymentDetail: {
    outputCurrency: OUTPUT_CURRENCIES[0],
    outputAmount: 0,
    reference: '',
  },
  //recipient: exampleRecipient,
  recipient: null,
  order: null,
  orderError: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case actions.SET_INPUT_CURRENCY: {
      const { inputCurrency } = action.payload;
      return {
        ...state,
        inputCurrency,
      };
    }
    case actions.SET_PAYMENT_DETAIL: {
      const { paymentDetail } = action.payload;
      return {
        ...state,
        paymentDetail,
      };
    }
    case actions.SET_RECIPIENT: {
      const { recipient } = action.payload;
      return {
        ...state,
        recipient,
      };
    }
    case actions.SET_ORDER: {
      const { order } = action.payload;
      return {
        ...state,
        order,
      };
    }
    case actions.SET_ORDER_ERROR: {
      const { orderError } = action.payload;
      return {
        ...state,
        orderError,
      };
    }
    case actions.RESET_ORDER: {
      return {
        ...state,
        order: null,
        orderError: null,
      };
    }
    default:
      return state;
  }
}
