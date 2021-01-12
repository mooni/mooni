import {DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY} from '../../lib/trading/currencyList';
import {
  OrderErrors,
  Payment,
  PaymentStatus,
  PaymentStepId,
  PaymentStepStatus,
} from '../../lib/types';
import { TradeExact } from '../../lib/trading/types';

import { BityTrade, MultiTrade, MultiTradeRequest, TradeType } from "../../lib/trading/types";

export const STATE_NAME = 'PAYMENT';

export interface PaymentState {
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
    ethInfo: {
      fromAddress: '0x14017C2A26D8e29e514354Fea097559bE7c02Aac'
    },
    tradeRequest: {
      inputCurrencySymbol: DEFAULT_INPUT_CURRENCY,
      outputCurrencySymbol: DEFAULT_OUTPUT_CURRENCY,
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
    ethInfo: {
      fromAddress: '0x14017C2A26D8e29e514354Fea097559bE7c02Aac'
    },
    tradeRequest: {
      inputCurrencySymbol: DEFAULT_INPUT_CURRENCY,
      outputCurrencySymbol: DEFAULT_OUTPUT_CURRENCY,
      amount: '50',
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
    ethInfo: {
      fromAddress: '0x14017C2A26D8e29e514354Fea097559bE7c02Aac'
    },
    tradeRequest: {
      inputCurrencySymbol: 'ETH',
      outputCurrencySymbol: 'EUR',
      amount: '50',
      tradeExact: TradeExact.OUTPUT
    },
  },
  multiTrade: {
    id: 'abcd-efgh',
    tradeRequest: {
      inputCurrencySymbol: 'ETH',
      outputCurrencySymbol: 'EUR',
      amount: '20',
      tradeExact: TradeExact.OUTPUT
    },
    ethAmount: '10',
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
    ethInfo: {
      fromAddress: '0x14017C2A26D8e29e514354Fea097559bE7c02Aac'
    },
    trades: [{
      tradeRequest: {
        inputCurrencySymbol: 'ETH',
        outputCurrencySymbol: 'EUR',
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
        id: '507da231-07c4-47df-aaed-8b469e1b28e1',
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
        // error: new Error('token-balance-too-low'),
      },
      {
        id: PaymentStepId.TRADE,
        status: PaymentStepStatus.DONE,
        // error: new Error('token-balance-too-low'),
      },
      {
        id: PaymentStepId.PAYMENT,
        status: PaymentStepStatus.DONE,
        // error: new Error('bity-order-cancelled'),
      },
      {
        id: PaymentStepId.BITY,
        status: PaymentStepStatus.WAITING,
        bityOrderId: '507da231-07c4-47df-aaed-8b469e1b28e1',
      },
    ],
  },
};

export const initialState = initialEmptyState;
// export const initialState = initialMockStateMinimum;
// export const initialState = initialMockStateComplete;
