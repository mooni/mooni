import { INPUT_CURRENCIES, OUTPUT_CURRENCIES } from '../../lib/currencies';

import * as actions from "./actions";

export const STATE_NAME = 'PAYMENT';

const initialEmptyState = {
  paymentStep: 0,
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
  paymentStatus: null,
  paymentTransaction: null,
};

const initialMockState = {
  paymentStep: 3,
  paymentRequest: {
    recipient: {
      iban: 'NL91ABNA9326322815',
      owner: {
        name: 'alice',
      }
    },
    contactPerson: null,
    amountDetail: {
      inputCurrency: INPUT_CURRENCIES[0],
      outputCurrency: OUTPUT_CURRENCIES[0],
      amount: 100,
      tradeExact: 'OUTPUT',
    },
    reference: '',
  },
  paymentOrder: {
    paymentRequest: {
      recipient: {
        iban: 'NL91ABNA9326322815',
        bic_swift: '12RE',
        owner: {
          name: 'Alice Martin',
          address: '12 rue marsan',
          zip: '33300',
          city: 'Bordeaux',
          country: 'France',
        }
      },
      contactPerson: {
        email: 'alice@gmail.com',
      },
      amountDetail: {
        inputCurrency: INPUT_CURRENCIES[0],
        outputCurrency: OUTPUT_CURRENCIES[0],
        amount: 121,
        tradeExact: 'OUTPUT',
      },
      reference: '',
    },
    path: 'BITY',
    bityOrder: {"input": {"amount": "0.95995978600951674", "currency": "ETH", "type": "crypto_address", "crypto_address": "0x4194ce73ac3fbbece8ffa878c2b5a8c90333e724"}, "output": {"amount": "121", "currency": "EUR", "type": "bank_account", "iban": "NL91ABNA9326322815", "reference": "feozijfze"}, "id": "d441af37-def4-4282-9491-fda18a5bfab5", "timestamp_created": "2020-03-25T11:02:39.315Z", "timestamp_awaiting_payment_since": "2020-03-25T11:02:41.713Z", "timestamp_price_guaranteed": "2021-03-25T11:12:41.713Z", "payment_details": {"crypto_address": "0x86be51fbc3ab2b66e8f9e0913a85cef7b1f89093", "type": "crypto_address"}, "price_breakdown": {"customer_trading_fee": {"amount": "0.00761648181486284", "currency": "ETH"}}},
  },
  orderError: null,
  paymentStatus: null,
  paymentTransaction: null,
};

// const initialState = initialEmptyState;
const initialState = initialMockState;

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
    case actions.SET_PAYMENT_STEP: {
      const { stepId } = action.payload;
      return {
        ...state,
        paymentStep: stepId,
      };
    }
    default:
      return state;
  }
}
