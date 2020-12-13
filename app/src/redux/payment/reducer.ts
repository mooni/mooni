import {DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY} from '../../lib/trading/currencyList';
import {getCurrency} from '../../lib/trading/currencyHelpers';
import {
  OrderErrors,
  Payment,
  PaymentStatus,
  PaymentStep,
  PaymentStepId,
  PaymentStepStatus,
  Recipient,
} from '../../lib/types';
import { TradeExact } from '../../lib/trading/types';

import * as actions from './actions';
import {BankInfo, BityTrade, MultiTrade, MultiTradeRequest, TradeRequest, TradeType} from "../../lib/trading/types";

export const STATE_NAME = 'PAYMENT';

interface PaymentState {
  exchangeStep: number;
  multiTradeRequest: MultiTradeRequest | null;
  multiTrade: MultiTrade | null;
  orderErrors: OrderErrors | null;
  payment: Payment | null;
}

// eslint-disable-next-line
const initialEmptyState: PaymentState = {
  exchangeStep: 0,
  multiTradeRequest: {
    bankInfo: {
      recipient: {
        owner: {
          name: '',
        },
        iban: '',
      },
      reference: '',
    },
    tradeRequest: {
      inputCurrency: getCurrency(DEFAULT_INPUT_CURRENCY),
      outputCurrency: getCurrency(DEFAULT_OUTPUT_CURRENCY),
      amount: '100',
      tradeExact: TradeExact.OUTPUT,
    },
  },
  multiTrade: null,
  orderErrors: null,
  payment: null,
};

// eslint-disable-next-line
const initialMockStateMinimum: PaymentState = {
  exchangeStep: 0,
  multiTradeRequest: {
    bankInfo: {
      recipient: {
        owner: {
          name: 'Alice Martin',
          country: 'NL',
          address: 'dfsfdsfq',
          zip: 'fdsqfqs',
          city: 'dsfqs'
        },
        iban: 'NL84INGB1679475908',
      },
      reference: '',
    },
    tradeRequest: {
      inputCurrency: getCurrency('DAI'),
      outputCurrency: getCurrency('EUR'),
      amount: '30',
      tradeExact: TradeExact.OUTPUT,
    },
  },
  multiTrade: null,
  orderErrors: null,
  payment: null,
};

// eslint-disable-next-line
const initialMockStateComplete: PaymentState = {
  exchangeStep: 0,
  multiTradeRequest: {
    bankInfo: {
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
      reference: 'ref'
    },
    tradeRequest: {
      inputCurrency: getCurrency('ETH'),
      outputCurrency: getCurrency('EUR'),
      amount: '10',
      tradeExact: TradeExact.OUTPUT
    },
  },
  multiTrade: {
    multiTradeRequest: {
      bankInfo: {
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
        reference: 'ref'
      },
      tradeRequest: {
        inputCurrency: getCurrency('ETH'),
        outputCurrency: getCurrency('EUR'),
        amount: '10',
        tradeExact: TradeExact.OUTPUT
      },
    },
    trades: [{
      tradeRequest: {
        inputCurrency: getCurrency('ETH'),
        outputCurrency: getCurrency('EUR'),
        amount: '10',
        tradeExact: TradeExact.OUTPUT,
      },
      tradeType: TradeType.BITY,
      inputAmount: '0.1',
      outputAmount: '10',
      bityOrderResponse: {
        input: {
          amount: '0.080414513629301225',
          currency: 'ETH',
          type: 'crypto_address',
          crypto_address: '0x90f227b0fbda2a4e788410afb758fa5bfe42be19'
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
      }
    } as BityTrade],
    path: [TradeType.BITY],
    inputAmount: '0.1',
    outputAmount: '10',
  },
  orderErrors: null,
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

// const initialState = initialEmptyState;
const initialState = initialMockStateMinimum;

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
