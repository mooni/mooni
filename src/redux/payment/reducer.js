import { INPUT_CURRENCIES, OUTPUT_CURRENCIES } from '../../lib/currencies';

import * as actions from "./actions";

export const STATE_NAME = 'PAYMENT';

const initialEmptyState = {
  paymentStep: 0,
  paymentRequest: {
    recipient: null,
    contactPerson: null,
    rateRequest: {
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
  paymentStep: 0,
  paymentRequest: {
    recipient: {
      owner: {
        name: 'fdsfds',
        country: ''
      },
      iban: 'NL91ABNA9326322815'
    },
    contactPerson: {
      email: 'zfezf@fre.vfr'
    },
    rateRequest: {
      inputCurrency: 'ETH',
      outputCurrency: 'EUR',
      amount: 10,
      tradeExact: 'OUTPUT'
    },
    reference: 'ceferfs'
  },
  paymentOrder: {
    paymentRequest: {
      recipient: {
        owner: {
          name: 'fdsfds',
          country: ''
        },
        iban: 'NL91ABNA9326322815'
      },
      contactPerson: {
        email: 'zfezf@fre.vfr'
      },
      rateRequest: {
        inputCurrency: 'ETH',
        outputCurrency: 'EUR',
        amount: 10,
        tradeExact: 'OUTPUT'
      },
      reference: 'ceferfs'
    },
    path: 'BITY',
    bityOrder: {
      input: {
        amount: '0.080414513629301225',
        currency: 'ETH',
        type: 'crypto_address',
        crypto_address: '0x4194ce73ac3fbbece8ffa878c2b5a8c90333e724'
      },
      output: {
        amount: '10',
        currency: 'EUR',
        type: 'bank_account',
        iban: 'NL91ABNA9326322815',
        reference: 'ceferfs'
      },
      id: '5daa7e15-e0ad-41c4-89aa-bc83bb346d73',
      timestamp_created: '2020-03-25T13:31:28.948Z',
      timestamp_awaiting_payment_since: '2020-03-25T13:31:31.831Z',
      timestamp_price_guaranteed: '2020-03-25T13:41:31.831Z',
      payment_details: {
        crypto_address: '0x90f227b0fbda2a4e788410afb758fa5bfe42be19',
        type: 'crypto_address'
      },
      price_breakdown: {
        customer_trading_fee: {
          amount: '0.000635986164121',
          currency: 'ETH'
        }
      },
      fees: {
        amount: '0.000635986164121',
        currency: 'ETH'
      }
    }
  },
  orderError: null,
  paymentStatus: 'mined',
  paymentTransaction: {
    hash: '0xbc6a9e0587c6bd877008e2b31b5735d1c96163eb9f5f1f893ff52af7c1b655f2'
  }
};

const initialState = initialEmptyState;
// const initialState = initialMockState;

export default function(state = initialState, action) {
  switch (action.type) {
    case actions.SET_RATE_REQUEST: {
      const { rateRequest } = action.payload;
      return {
        ...state,
        paymentRequest: {
          ...state.paymentRequest,
          rateRequest,
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
      const { paymentTransaction } = action.payload;
      return {
        ...state,
        paymentTransaction,
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
