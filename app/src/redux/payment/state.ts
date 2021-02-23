import { DEFAULT_INPUT_CURRENCY_OBJECT, DEFAULT_OUTPUT_CURRENCY_OBJECT } from '../../lib/trading/currencyList';
import { OrderErrors, Payment, PaymentStatus, PaymentStepId, PaymentStepStatus } from '../../lib/types';
import { MultiTrade, MultiTradeRequest, TradeExact, TradeType } from '../../lib/trading/types';
import { CurrencyType } from '../../lib/trading/currencyTypes';

export const STATE_NAME = 'PAYMENT';

export interface PaymentState {
  exchangeStep: number;
  multiTradeRequest: MultiTradeRequest;
  multiTrade: MultiTrade | null;
  orderErrors: OrderErrors | null;
  payment: Payment | null;
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
      inputCurrencyObject: DEFAULT_INPUT_CURRENCY_OBJECT,
      outputCurrencyObject: DEFAULT_OUTPUT_CURRENCY_OBJECT,
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
        iban: 'NL37INGB8265634552',
      },
      reference: '',
    },
    ethInfo: {
      fromAddress: '0x1cD300E6d25193Fb6CbEF685ACb89B4B39dc9d79'
    },
    tradeRequest: {
      inputCurrencyObject: DEFAULT_INPUT_CURRENCY_OBJECT,
      outputCurrencyObject: DEFAULT_OUTPUT_CURRENCY_OBJECT,
      amount: '0.1',
      tradeExact: TradeExact.INPUT,
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
      inputCurrencyObject: DEFAULT_INPUT_CURRENCY_OBJECT,
      outputCurrencyObject: DEFAULT_OUTPUT_CURRENCY_OBJECT,
      amount: '50',
      tradeExact: TradeExact.OUTPUT
    },
  },
  multiTrade: {
    tradeRequest: {
      inputCurrencyObject: {
        type: CurrencyType.ERC20,
        decimals: 18,
        symbol: 'ZKS',
        name: '',
        address: '0xe4815AE53B124e7263F08dcDBBB757d41Ed658c6',
        chainId: 1
      },
      outputCurrencyObject: {
        type: CurrencyType.FIAT,
        decimals: 2,
        symbol: 'EUR',
        name: 'Euro'
      },
      amount: '40',
      tradeExact: TradeExact.OUTPUT,
    },
    ethInfo: {
      fromAddress: '0x14017C2A26D8e29e514354Fea097559bE7c02Aac'
    },
    bankInfo: {
      recipient: {
        iban: 'NL37INGB8265634552',
        owner: {
          name: 'Alice Martin',
          address: 'dfsfdsfq',
          zip: 'fdsqfqs',
          city: 'dsfqs',
          country: 'NL'
        }
      },
      reference: ''
    },
    trades: [
      {
        tradeRequest: {
          inputCurrencyObject: {
            type: CurrencyType.ERC20,
            decimals: 18,
            symbol: 'ZKS',
            name: '',
            address: '0xe4815AE53B124e7263F08dcDBBB757d41Ed658c6',
            chainId: 1
          },
          outputCurrencyObject: {
            type: CurrencyType.CRYPTO,
            decimals: 18,
            symbol: 'ETH',
            name: 'Ether'
          },
          amount: '0.031073706971944777',
          tradeExact: TradeExact.OUTPUT
        },
        inputAmount: '5.172208645176545',
        outputAmount: '0.031073706971944777',
        tradeType: TradeType.DEX,
        dexMetadata: {
          priceRoute: {
            side: 'BUY',
            destAmount: '31073706971944777',
            srcAmount: '5172208645176545000',
            bestRoute: [
              {
                exchange: 'SushiSwap',
                destAmount: '31073706971944777',
                srcAmount: '5172208645176545000',
                percent: 100,
                data: {
                  tokenFrom: '0xe4815ae53b124e7263f08dcdbbb757d41ed658c6',
                  tokenTo: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                  path: [
                    '0xe4815ae53b124e7263f08dcdbbb757d41ed658c6',
                    '0xdac17f958d2ee523a2206206994597c13d831ec7',
                    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
                  ],
                  router: '0xBc1315CD2671BC498fDAb42aE1214068003DC51e',
                  gasUSD: '210.9852875551746'
                },
                srcAmountNoFeeAdded: '5172208645176545000',
                destAmountNoFeeAdded: '31073706971944777'
              }
            ],
            others: [
              {
                exchange: 'UniswapV2',
                rate: '6608433803702654000',
                unit: '213060073087189600000',
                data: {
                  tokenFrom: '0xe4815ae53b124e7263f08dcdbbb757d41ed658c6',
                  tokenTo: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                  path: [
                    '0xe4815ae53b124e7263f08dcdbbb757d41ed658c6',
                    '0xdac17f958d2ee523a2206206994597c13d831ec7',
                    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
                  ],
                  router: '0x86d3579b043585A97532514016dCF0C2d6C4b6a1',
                  gasUSD: '210.9852875551746'
                },
                rateNoFeeAdded: '6608433803702654000',
                unitNoFeeAdded: '213060073087189600000'
              },
              {
                exchange: 'SushiSwap',
                rate: '5172208645176543000',
                unit: '357681241357273000000',
                data: {
                  tokenFrom: '0xe4815ae53b124e7263f08dcdbbb757d41ed658c6',
                  tokenTo: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                  path: [
                    '0xe4815ae53b124e7263f08dcdbbb757d41ed658c6',
                    '0xdac17f958d2ee523a2206206994597c13d831ec7',
                    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
                  ],
                  router: '0xBc1315CD2671BC498fDAb42aE1214068003DC51e',
                  gasUSD: '210.9852875551746'
                },
                rateNoFeeAdded: '5172208645176543000',
                unitNoFeeAdded: '357681241357273000000'
              }
            ],
            blockNumber: 11911514,
            details: {
              tokenFrom: '0xe4815ae53b124e7263f08dcdbbb757d41ed658c6',
              tokenTo: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
              destAmount: '31073706971944777',
              srcAmount: '5172208645176545000'
            },
            fromUSD: '40.3432274323',
            toUSD: '50.5325651370',
            priceWithSlippage: '5223930731628310450',
            bestRouteGasCostUSD: '311',
            bestRouteGas: '459474',
            srcAmountNoFeeAdded: '5172208645176545000',
            destAmountNoFeeAdded: '31073706971944777',
            fromUSDNoFeeAdded: '40.3432274323',
            toUSDNoFeeAdded: '50.5325651370',
            multiRoute: []
          }
        },
        maxSlippage: 0.01
      },
      {
        tradeRequest: {
          inputCurrencyObject: {
            type: CurrencyType.CRYPTO,
            decimals: 18,
            symbol: 'ETH',
            name: 'Ether'
          },
          outputCurrencyObject: {
            type: CurrencyType.FIAT,
            decimals: 2,
            symbol: 'EUR',
            name: 'Euro'
          },
          amount: '40',
          tradeExact: TradeExact.OUTPUT
        },
        inputAmount: '0.031073706971944777',
        outputAmount: '40',
        tradeType: TradeType.BITY,
        bityOrderResponse: {
          input: {
            amount: '0.031073706971944777',
            currency: 'ETH',
            type: 'crypto_address',
            crypto_address: '0x14017C2A26D8e29e514354Fea097559bE7c02Aac'
          },
          output: {
            amount: '40',
            currency: 'EUR',
            type: 'bank_account',
            iban: 'NL37INGB8265634552'
          },
          id: '3679291c-1c85-453d-aaf2-ab3c3b81c0de',
          timestamp_created: '2021-02-23T05:53:12.148Z',
          timestamp_awaiting_payment_since: '2021-02-23T05:53:17.034Z',
          timestamp_price_guaranteed: '2021-02-24T06:03:17.034Z',
          payment_details: {
            crypto_address: '0xbe439764e227996f23869c35d0228245aa8b08e3',
            type: 'crypto_address'
          },
          price_breakdown: {
            customer_trading_fee: {
              amount: '0.000239461397438347',
              currency: 'ETH'
            },
            partner_fee: {
              amount: '0.000621474139438896',
              currency: 'ETH'
            }
          }
        },
        fee: {
          amount: '0.000860935536877243',
          currencyObject: {
            type: CurrencyType.CRYPTO,
            decimals: 18,
            symbol: 'ETH',
            name: 'Ether'
          }
        }
      }
    ],
    inputAmount: '5.172208645176545',
    outputAmount: '40',
    path: [
      TradeType.DEX,
      TradeType.BITY,
    ],
    ethAmount: '0.031073706971944777',
    id: 'af9e5fcd-3ed3-4c21-b398-edb6ad68c8de'
  },
  orderErrors: null,
  payment: {
    status: PaymentStatus.DONE,
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

// export const initialState = initialEmptyState;
export const initialState = initialMockStateMinimum;
// export const initialState = initialMockStateComplete;
