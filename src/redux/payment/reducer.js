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
  iban: 'FR7630006000011234567890189',
  bic_swift: 'BNPAFRPP',
};
const exampleRecipientOnlyNameAndIban = {
  owner: {
    name: 'Alice Martin',
  },
  iban: 'FR7630006000011234567890189',
};

const exampleOrder = {"input": {"amount": "0.742746699517954364", "currency": "ETH", "type": "crypto_address", "crypto_address": "0x430f05b7cf0a80dcfeeebb45fe8a8d008c13141e"}, "output": {"amount": "100", "currency": "EUR", "type": "bank_account", "iban": "FR7630006000011234567890189"}, "id": "d554c5c4-e0cd-499f-be13-f2c3107ca658", "timestamp_created": "2019-11-25T18:24:44.874Z", "timestamp_awaiting_payment_since": "2019-11-25T18:24:46.870Z", "timestamp_price_guaranteed": "2019-11-25T18:34:46.870Z", "payment_details": {"crypto_address": "0x0ab11b28e1706d504583abbe3428027d96c59a65", "type": "crypto_address"}, "price_breakdown": {"customer_trading_fee": {"amount": "0.005892573957327453", "currency": "ETH"}}};
*/

const initialState = {
  inputCurrency: null,
  paymentDetail: {
    outputCurrency: OUTPUT_CURRENCIES[0],
    outputAmount: 100,
    reference: '',
  },
  recipient: null,
  // recipient: exampleRecipient,
  // recipient: exampleRecipientOnlyNameAndIban,
  contactPerson: null,
  order: null,
  //order: exampleOrder,
  orderError: null,
  paymentStatus: null,
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
    case actions.SET_CONTACT_PERSON: {
      const { contactPerson } = action.payload;
      return {
        ...state,
        contactPerson,
      };
    }
    case actions.SET_ORDER: {
      const { order } = action.payload;
      return {
        ...state,
        order,
      };
    }
    case actions.SET_ORDER_ERRORS: {
      const { orderErrors } = action.payload;
      return {
        ...state,
        orderErrors,
      };
    }
    case actions.RESET_ORDER: {
      return {
        ...state,
        order: null,
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
    default:
      return state;
  }
}
