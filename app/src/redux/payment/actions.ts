import {getMultiTrade, getMultiTradeRequest} from './selectors';
import {getAddress, getETHManager, getJWS} from '../eth/selectors';
import {
  Payment,
  PaymentStatus,
  PaymentStepId,
  PaymentStepStatus, Recipient
} from '../../lib/types';
import {
  BityOrderStatus,
} from '../../lib/wrappers/bityTypes';
import {sendEvent} from '../../lib/analytics';
import Api from '../../lib/api';
import { track } from '../../lib/analytics';
import { log, logError } from '../../lib/log';
import { detectWalletError } from '../../lib/web3Wallets';
import {BityTrade, DexTrade, MultiTrade, TradeRequest, TradeType} from "../../lib/trading/types";
import DexProxy from "../../lib/trading/dexProxy";

export const SET_TRADE_REQUEST = 'SET_TRADE_REQUEST';

export const SET_EXCHANGE_STEP = 'SET_EXCHANGE_STEP';

export const SET_RECIPIENT = 'SET_RECIPIENT';
export const SET_REFERENCE = 'SET_REFERENCE';
export const SET_REFERAL = 'SET_REFERAL';

export const SET_MULTITRADE = 'SET_MULTITRADE';
export const SET_ORDER_ERRORS = 'SET_ORDER_ERRORS';
export const RESET_ORDER = 'RESET_ORDER';

export const RESET_PAYMENT = 'RESET_PAYMENT';
export const SET_PAYMENT = 'SET_PAYMENT';
export const UPDATE_PAYMENT_STEP = 'UPDATE_PAYMENT_STEP';
export const SET_PAYMENT_STATUS = 'SET_PAYMENT_STATUS';

export const setTradeRequest = (tradeRequest: TradeRequest) => ({
  type: SET_TRADE_REQUEST,
  payload: {
    tradeRequest,
  }
});

export const setExchangeStep = (stepId: number) => ({
  type: SET_EXCHANGE_STEP,
  payload: {
    stepId,
  }
});

export const setRecipient = (recipient: Recipient) => ({
  type: SET_RECIPIENT,
  payload: {
    recipient,
  }
});
export const setReference = (reference: string) => ({
  type: SET_REFERENCE,
  payload: {
    reference,
  }
});
export const setReferal = (referalId: string) => ({
  type: SET_REFERAL,
  payload: {
    referalId,
  }
});

export const setMultiTrade = (multiTrade: MultiTrade | null) => ({
  type: SET_MULTITRADE,
  payload: {
    multiTrade,
  }
});

export const setOrderErrors = (errors) => ({
  type: SET_ORDER_ERRORS,
  payload: {
    orderErrors: errors,
  }
});

export const resetOrder = () => ({
  type: RESET_ORDER,
});

export const resetPayment = () => ({
  type: RESET_PAYMENT,
});

export const setPayment = (payment: Payment) => ({
  type: SET_PAYMENT,
  payload: { payment },
});

export const updatePaymentStep = (paymentStepUpdate: any) => ({
  type: UPDATE_PAYMENT_STEP,
  payload: { paymentStepUpdate },
});

export const setPaymentStatus = (status: PaymentStatus) => ({
  type: SET_PAYMENT_STATUS,
  payload: { status },
});

export const createPayment = (multiTrade: MultiTrade) => (dispatch) => {
  const payment: Payment = {
    steps: [],
    status: PaymentStatus.ONGOING,
  };

  const dexTrades = multiTrade.trades.filter(t => t.tradeType === TradeType.BITY) as DexTrade[];
  if(dexTrades.length > 1) {
    throw new Error('Only one dex exchange is supported per payment');
  }
  if(multiTrade.path.includes(TradeType.DEX)) {
    payment.steps.push({
      id: PaymentStepId.ALLOWANCE,
      status: PaymentStepStatus.QUEUED,
    });
    payment.steps.push({
      id: PaymentStepId.TRADE,
      status: PaymentStepStatus.QUEUED,
    });
  }

  const bityTrades = multiTrade.trades.filter(t => t.tradeType === TradeType.BITY) as BityTrade[];
  if(bityTrades.length !== 1) {
    throw new Error('Payments must pass through bity');
  }
  payment.steps.push({
    id: PaymentStepId.PAYMENT,
    status: PaymentStepStatus.QUEUED,
  });
  payment.steps.push({
    id: PaymentStepId.BITY,
    status: PaymentStepStatus.QUEUED,
    bityOrderId: bityTrades[0].bityOrderResponse.id,
  });

  dispatch(setPayment(payment));
};

export const createOrder = () => async function (dispatch, getState)  {
  dispatch(resetOrder());

  sendEvent('order', 'create', 'init');

  const state = getState();
  const multiTradeRequest = getMultiTradeRequest(state);
  if(!multiTradeRequest) throw new Error('Missing multiTradeRequest');

  multiTradeRequest.ethInfo = {
    fromAddress: getAddress(state),
  };

  const jwsToken = getJWS(state);
  try {

    const multiTrade = await Api.createMultiTrade(multiTradeRequest, jwsToken);
    dispatch(setMultiTrade(multiTrade));
    dispatch(createPayment(multiTrade));

    sendEvent('order', 'create', 'done');

  } catch(error) {
    dispatch(setMultiTrade(null));

    sendEvent('order', 'create', 'error');
    if(error.message === 'timeout') {
      logError('Create order: timeout', error);
      dispatch(setOrderErrors([{
        code: 'timeout',
        message: 'The request could not be executed within the allotted time. Please retry later.'
      }]));
    } else if (error._bityError) {
      logError('Create order: Bity error', error);
      dispatch(setOrderErrors(error.meta.errors));
    } else if(error._apiError) {
      logError('Create order: API error', error);
      dispatch(setOrderErrors([{code: error.message, message: error.description}]));
    } else {
      logError('Create order: unknown error', error);
      dispatch(setOrderErrors([{code: 'unknown', message: 'Unknown error'}]));
    }
  }
};

async function sendPaymentStep({ dispatch, stepId, paymentFunction, ethManager }) {
  dispatch(updatePaymentStep({
    id: stepId,
    status: PaymentStepStatus.APPROVAL,
  }));

  try {
    const txHash = await paymentFunction();

    if(txHash) {
      dispatch(updatePaymentStep({
        id: stepId,
        status: PaymentStepStatus.MINING,
        txHash,
      }));
      await ethManager.waitForConfirmedTransaction(txHash);
    }

    dispatch(updatePaymentStep({
      id: stepId,
      status: PaymentStepStatus.DONE,
    }));
  } catch(error) {

    let capturedError = detectWalletError(error);
    dispatch(updatePaymentStep({
      id: stepId,
      status: PaymentStepStatus.ERROR,
      error: capturedError,
    }));
    throw capturedError;

  }
}

type Timeout = ReturnType<typeof setTimeout>;
const watching: Map<string, Timeout> = new Map();
const POLL_INTERVAL = 5000;

export const watchBityOrder = (orderId) => (dispatch, getState) => {
  if(watching.get(orderId)) return;
  const jwsToken = getJWS(getState());

  dispatch(updatePaymentStep({
    id: PaymentStepId.BITY,
    status: PaymentStepStatus.WAITING,
  }));

  function fetchNewData() {
    Api.getBityOrder(orderId, jwsToken)
      .then(orderDetails => {
        if(!watching.has(orderId)) return;
        const timer = watching.get(orderId) as Timeout;

        if(orderDetails.orderStatus === BityOrderStatus.RECEIVED) {

          dispatch(updatePaymentStep({
            id: PaymentStepId.BITY,
            status: PaymentStepStatus.RECEIVED,
          }));
          log('PAYMENT: bity received');
          track('PAYMENT: bity received');

        } else if(orderDetails.orderStatus === BityOrderStatus.EXECUTED) {

          clearInterval(timer);
          watching.delete(orderId);
          dispatch(updatePaymentStep({
            id: PaymentStepId.BITY,
            status: PaymentStepStatus.DONE,
          }));
          dispatch(setPaymentStatus(PaymentStatus.DONE));
          sendEvent('payment', 'send', 'done');
          log('PAYMENT: bity ok');
          track('PAYMENT: bity ok');

        } else if(orderDetails.orderStatus === BityOrderStatus.CANCELLED) {

          clearInterval(timer);
          watching.delete(orderId);
          dispatch(updatePaymentStep({
            id: PaymentStepId.BITY,
            status: PaymentStepStatus.ERROR,
            error: new Error('bity-order-cancelled'),
          }));
          dispatch(setPaymentStatus(PaymentStatus.ERROR));
          sendEvent('payment', 'send', 'error');
          log('PAYMENT: bity cancelled');
          track('PAYMENT: bity cancelled');

        }
      })
      .catch(error => logError('Error while fetching order state', error));
  }
  fetchNewData();
  watching.set(orderId, setInterval(fetchNewData, POLL_INTERVAL));
}

export const sendPayment = () => async function (dispatch, getState)  {

  sendEvent('payment', 'send', 'init');

  const state = getState();
  const multiTrade = getMultiTrade(state);
  if(!multiTrade) throw new Error('Missing multitrade');

  const ethManager = getETHManager(state);

  const bityTrade = multiTrade.trades.find(t => t.tradeType === TradeType.BITY) as BityTrade;
  const dexTrade = multiTrade.trades.find(t => t.tradeType === TradeType.DEX) as DexTrade;

  const bityOrderId = bityTrade.bityOrderResponse.id;
  log('PAYMENT: bity order id', bityOrderId);
  log('PAYMENT: ETH address', ethManager.getAddress());

  try {
    if(dexTrade) {
      if(!dexTrade.dexMetadata) throw new Error('missing dex meta data');

      // Allowance
      await sendPaymentStep({
        dispatch, ethManager,
        stepId: PaymentStepId.ALLOWANCE,
        paymentFunction: async () => DexProxy.checkAndApproveAllowance(dexTrade, ethManager.provider)
      });
      log('PAYMENT: allowance ok');
      track('PAYMENT: allowance ok');

      // Trade
      await sendPaymentStep({
        dispatch, ethManager,
        stepId: PaymentStepId.TRADE,
        paymentFunction: async () => DexProxy.executeTrade(
          dexTrade,
          ethManager.provider,
          0.01, // TODO let user choose that
        )
      });
      log('PAYMENT: trade ok');
      track('PAYMENT: trade ok');

    }

    // Payment
    const bityInputAmount = bityTrade.inputAmount;
    const bityDepositAddress = bityTrade.bityOrderResponse.payment_details.crypto_address;
    await sendPaymentStep({
      dispatch, ethManager,
      stepId: PaymentStepId.PAYMENT,
      paymentFunction: async () => ethManager.send(bityDepositAddress, bityInputAmount).then(tx => tx.hash)
    });
    log('PAYMENT: payment ok');
    track('PAYMENT: payment ok');

  } catch(error) {

    logError('Error while sending payment', error);
    sendEvent('payment', 'send', 'error');
    dispatch(setPaymentStatus(PaymentStatus.ERROR));

  }
};

export const initReferal = () => async function (dispatch, getState) {
  const query = new URLSearchParams(window.location.search);
  const referalId = query.get('referalId');

  if(referalId) {
    dispatch(setReferal(referalId));
  }
};
