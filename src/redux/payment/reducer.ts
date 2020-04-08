import { INPUT_CURRENCIES, OUTPUT_CURRENCIES, DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY } from '../../lib/currencies';
import { TradeExact, ExchangePath, Order, OrderErrors, OrderRequest, RateRequest, Recipient } from '../../lib/types';

import * as actions from './actions';

export const STATE_NAME = 'PAYMENT';

export interface State {
  exchangeStep: number;
  orderRequest?: OrderRequest;
  order?: Order;
  orderErrors?: OrderErrors;
  paymentStatus?: string;
  paymentTransaction?: any;
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
  paymentStatus: undefined,
  paymentTransaction: undefined,
};

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
      inputCurrency: INPUT_CURRENCIES[1],
      outputCurrency: OUTPUT_CURRENCIES[0],
      amount: '20',
      tradeExact: TradeExact.OUTPUT,
    },
    reference: '',
  },
  order: undefined,
  orderErrors: undefined,
  paymentStatus: undefined,
  paymentTransaction: undefined,
};

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
  paymentStatus: 'mined',
  paymentTransaction: {
    hash: '0xbc6a9e0587c6bd877008e2b31b5735d1c96163eb9f5f1f893ff52af7c1b655f2'
  }
};

const initialState = initialEmptyState;
// const initialState = initialMockStateMinimum;

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
    case actions.SET_PAYMENT_STATUS: {
      const { paymentStatus }: { paymentStatus: string } = action.payload;
      return {
        ...state,
        paymentStatus,
      };
    }
    case actions.SET_PAYMENT_TRANSACTION: {
      const { paymentTransaction }: { paymentTransaction: any } = action.payload;
      return {
        ...state,
        paymentTransaction,
      };
    }
    case actions.SET_PAYMENT_STEP: {
      const { stepId }: { stepId: number } = action.payload;
      return {
        ...state,
        exchangeStep: stepId,
      };
    }
    default:
      return state;
  }
}
