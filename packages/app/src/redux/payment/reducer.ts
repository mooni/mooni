import {
  DEFAULT_INPUT_CURRENCY,
  DEFAULT_OUTPUT_CURRENCY,
} from '../../lib/currencies';
import {
  ExchangePath,
  Order,
  OrderErrors,
  OrderRequest,
  Payment,
  PaymentStatus,
  PaymentStep,
  PaymentStepId,
  PaymentStepStatus,
  RateRequest,
  Recipient,
  TradeExact
} from '../../lib/types';

import * as actions from './actions';

export const STATE_NAME = 'PAYMENT';

export interface State {
  exchangeStep: number;
  orderRequest?: OrderRequest;
  order?: Order;
  orderErrors?: OrderErrors;
  payment?: Payment;
}

const initialEmptyState: State = {
  exchangeStep: 0,
  orderRequest: {
    recipient: {
      owner: {
        name: '',
      },
      iban: '',
    },
    rateRequest: {
      inputCurrency: DEFAULT_INPUT_CURRENCY,
      outputCurrency: DEFAULT_OUTPUT_CURRENCY,
      amount: '100',
      tradeExact: TradeExact.OUTPUT,
    },
    reference: '',
  },
  order: undefined,
  orderErrors: undefined,
  payment: undefined,
};

// eslint-disable-next-line
const initialMockStateMinimum: State = {
  exchangeStep: 0,
  orderRequest: {
    recipient: {
      owner: {
        name: 'Alice Martin',
      },
      iban: 'NL84INGB1679475908',
    },
    rateRequest: {
      inputCurrency: 'DAI',
      outputCurrency: 'EUR',
      amount: '10',
      tradeExact: TradeExact.OUTPUT,
    },
    reference: '',
  },
  order: undefined,
  orderErrors: undefined,
  payment: undefined,
};

// eslint-disable-next-line
const initialMockStateComplete: State = {
  exchangeStep: 0,
  orderRequest: {
    recipient: {
      owner: {
        country: 'NL',
        name: 'fdsfsd',
        address: 'dfsfdsfq',
        zip: 'fdsqfqs',
        city: 'dsfqs'
      },
      iban: 'NL84INGB1679475908',
      bic_swift: 'CMCIFR2A',
      email: 'dfd@fez.fr'
    },
    rateRequest: {
      inputCurrency: 'ETH',
      outputCurrency: 'EUR',
      amount: '10',
      tradeExact: TradeExact.OUTPUT
    },
    reference: 'ref'
  },
  order: {
    orderRequest: {
      recipient: {
        owner: {
          country: 'NL',
          name: 'fdsfsd',
          address: 'dfsfdsfq',
          zip: 'fdsqfqs',
          city: 'dsfqs'
        },
        iban: 'NL84INGB1679475908',
        bic_swift: 'CMCIFR2A',
        email: 'dfd@fez.fr'
      },
      rateRequest: {
        inputCurrency: 'ETH',
        outputCurrency: 'EUR',
        amount: '10',
        tradeExact: TradeExact.OUTPUT
      },
      reference: 'ref'
    },
    estimatedRates: {
      inputCurrency: 'ETH',
      outputCurrency: 'EUR',
      inputAmount: '0.1',
      outputAmount: '10',
    },
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
      timestamp_price_guaranteed: '2021-03-25T13:41:31.831Z',
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
    },
    path: ExchangePath.BITY,
  },
  orderErrors: undefined,
  payment: {
    status: PaymentStatus.ERROR,
    steps: [
      {
        id: PaymentStepId.ALLOWANCE,
        status: PaymentStepStatus.DONE,
        txHash: 'fref',
        error: new Error('token-balance-too-low'),
      },
      {
        id: PaymentStepId.TRADE,
        status: PaymentStepStatus.APPROVAL,
        // error: new Error('token-balance-too-low'),
      },
      {
        id: PaymentStepId.PAYMENT,
        status: PaymentStepStatus.ERROR,
        // error: new Error('bity-order-cancelled'),
      },
      {
        id: PaymentStepId.BITY,
        status: PaymentStepStatus.MINING,
      },
    ],
  },
};

const initialState = initialEmptyState;
// const initialState = initialMockStateComplete;

export default function(state : State = initialState, action: { type: string, payload?: any }): State {
  switch (action.type) {
    case actions.SET_RATE_REQUEST: {
      const { rateRequest }: { rateRequest: RateRequest } = action.payload;

      return {
        ...state,
        orderRequest: {
          ...(state.orderRequest as OrderRequest),
          rateRequest,
        },
      };
    }
    case actions.SET_RECIPIENT: {
      const { recipient }: { recipient: Recipient } = action.payload;
      return {
        ...state,
        orderRequest: {
          ...(state.orderRequest as OrderRequest),
          recipient,
        },
      };
    }
    case actions.SET_REFERENCE: {
      const { reference }: { reference: string } = action.payload;
      return {
        ...state,
        orderRequest: {
          ...(state.orderRequest as OrderRequest),
          reference,
        },
      };
    }
    case actions.SET_ORDER: {
      const { order }: { order: Order } = action.payload;
      return {
        ...state,
        order,
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
        order: undefined,
        orderErrors: undefined,
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
        payment: undefined,
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
