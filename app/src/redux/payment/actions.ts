import { getMultiTrade, getMultiTradeRequest } from './selectors'
import { getAddress, getETHManager, getJWS } from '../wallet/selectors'
import { Payment, PaymentStatus, PaymentStepId, PaymentStepStatus, Recipient } from '../../lib/types'
import { BityOrderStatus } from '../../lib/wrappers/bityTypes'
import { sendEvent, track } from '../../lib/analytics'
import MooniAPI from '../../lib/wrappers/mooni'
import { log, logError } from '../../lib/log'
import { detectWalletError } from '../../lib/web3Wallets'
import { BityTrade, DexTrade, MultiTrade, TradeRequest, TradeType } from '../../lib/trading/types'
import DexProxy from '../../lib/trading/dexProxy'
import { MetaError } from '../../lib/errors'
import { CurrencyObject } from '../../lib/trading/currencyTypes'
import { MooniOrder, MooniOrderStatus } from '../../types/api'

export const SET_TRADE_REQUEST = 'SET_TRADE_REQUEST'
export const SET_INPUT_CURRENCY = 'SET_INPUT_CURRENCY'

export const SET_EXCHANGE_STEP = 'SET_EXCHANGE_STEP'

export const SET_RECIPIENT = 'SET_RECIPIENT'
export const SET_REFERENCE = 'SET_REFERENCE'
export const SET_REFERRAL = 'SET_REFERRAL'

export const SET_MULTITRADE = 'SET_MULTITRADE'
export const SET_MOONI_ORDER = 'SET_MOONI_ORDER'
export const SET_ORDER_ERRORS = 'SET_ORDER_ERRORS'
export const RESET_ORDER = 'RESET_ORDER'

export const SET_PAYMENT = 'SET_PAYMENT'
export const UPDATE_PAYMENT_STEP = 'UPDATE_PAYMENT_STEP'
export const SET_PAYMENT_STATUS = 'SET_PAYMENT_STATUS'

export const setTradeRequest = (tradeRequest: TradeRequest) => ({
  type: SET_TRADE_REQUEST,
  payload: {
    tradeRequest,
  },
})
export const setInputCurrency = (inputCurrencyObject: CurrencyObject) => ({
  type: SET_INPUT_CURRENCY,
  payload: {
    inputCurrencyObject,
  },
})

export const setExchangeStep = (stepId: number) => ({
  type: SET_EXCHANGE_STEP,
  payload: {
    stepId,
  },
})

export const setRecipient = (recipient: Recipient) => ({
  type: SET_RECIPIENT,
  payload: {
    recipient,
  },
})
export const setReference = (reference: string) => ({
  type: SET_REFERENCE,
  payload: {
    reference,
  },
})
export const setReferral = (referralId: string) => ({
  type: SET_REFERRAL,
  payload: {
    referralId,
  },
})

export const setMultiTrade = (multiTrade: MultiTrade | null) => ({
  type: SET_MULTITRADE,
  payload: {
    multiTrade,
  },
})
export const setMooniOrder = (mooniOrder: MooniOrder | null) => ({
  type: SET_MOONI_ORDER,
  payload: {
    mooniOrder,
  },
})

export const setOrderErrors = (errors) => ({
  type: SET_ORDER_ERRORS,
  payload: {
    orderErrors: errors,
  },
})

export const resetOrder = () => ({
  type: RESET_ORDER,
})

export const setPayment = (payment: Payment) => ({
  type: SET_PAYMENT,
  payload: { payment },
})

export const updatePaymentStep = (paymentStepUpdate: any) => ({
  type: UPDATE_PAYMENT_STEP,
  payload: { paymentStepUpdate },
})

export const setPaymentStatus = (status: PaymentStatus) => ({
  type: SET_PAYMENT_STATUS,
  payload: { status },
})

const createPayment = (multiTrade: MultiTrade) => (dispatch) => {
  const payment: Payment = {
    steps: [],
    status: PaymentStatus.PENDING,
  }

  const dexTrades = multiTrade.trades.filter((t) => t.tradeType === TradeType.BITY) as DexTrade[]
  if (dexTrades.length > 1) {
    throw new Error('Only one dex exchange is supported per payment')
  }
  if (multiTrade.path.includes(TradeType.DEX)) {
    payment.steps.push({
      id: PaymentStepId.ALLOWANCE,
      status: PaymentStepStatus.QUEUED,
    })
    payment.steps.push({
      id: PaymentStepId.TRADE,
      status: PaymentStepStatus.QUEUED,
    })
  }

  const bityTrades = multiTrade.trades.filter((t) => t.tradeType === TradeType.BITY) as BityTrade[]
  if (bityTrades.length !== 1) {
    throw new Error('Payments must pass through bity')
  }
  payment.steps.push({
    id: PaymentStepId.PAYMENT,
    status: PaymentStepStatus.QUEUED,
  })
  payment.steps.push({
    id: PaymentStepId.BITY,
    status: PaymentStepStatus.QUEUED,
    bityOrderId: bityTrades[0].bityOrderResponse.id,
  })

  dispatch(setPayment(payment))
}

export const createOrder = () =>
  async function (dispatch, getState) {
    dispatch(resetOrder())

    const state = getState()
    const multiTradeRequest = getMultiTradeRequest(state)
    if (!multiTradeRequest) throw new Error('Missing multiTradeRequest')

    multiTradeRequest.ethInfo = {
      fromAddress: getAddress(state),
    }

    const jwsToken = getJWS(state)
    try {
      const multiTrade = await MooniAPI.createMultiTrade(multiTradeRequest, jwsToken)
      dispatch(setMultiTrade(multiTrade))
      dispatch(createPayment(multiTrade))

      sendEvent('order_created')
    } catch (error) {
      dispatch(resetOrder())

      sendEvent('order_creation_error')
      if (error.message === 'timeout') {
        logError('Create order: timeout', error)
        dispatch(
          setOrderErrors([
            {
              code: 'timeout',
              message: 'The request could not be executed within the allotted time. Please retry later.',
            },
          ])
        )
      } else if (error._bityError) {
        logError('Create order: Bity error', error)
        dispatch(setOrderErrors(error.meta.errors))
      } else if (error._apiError) {
        logError('Create order: API error', error)
        dispatch(setOrderErrors([{ code: error.message, message: error.description }]))
      } else {
        logError('Create order: unknown error', error)
        dispatch(setOrderErrors([{ code: 'unknown', message: 'Unknown error' }]))
      }
      throw new Error('unable to create order')
    }
  }

const sendPaymentStep = ({ stepId, paymentFunction }) => async (dispatch, getState) => {
  dispatch(
    updatePaymentStep({
      id: stepId,
      status: PaymentStepStatus.APPROVAL,
    })
  )

  const state = getState()
  const ethManager = getETHManager(state)
  const multiTrade = getMultiTrade(state)
  const jws = getJWS(state)
  if (!multiTrade) {
    throw new MetaError('missing_state', { values: ['multitrade'] })
  }

  try {
    if (stepId === PaymentStepId.PAYMENT) {
      const mooniOrder = await MooniAPI.getOrder(multiTrade.id, jws)
      if (mooniOrder.status === MooniOrderStatus.CANCELLED) {
        throw new MetaError('order_canceled_not_paying')
      }
    }
    const txHash = await paymentFunction()
    if (stepId === PaymentStepId.PAYMENT) {
      await MooniAPI.setPaymentTx(multiTrade.id, txHash, jws)
    }

    if (txHash) {
      dispatch(
        updatePaymentStep({
          id: stepId,
          status: PaymentStepStatus.MINING,
          txHash,
        })
      )
      await ethManager.waitForConfirmedTransaction(txHash)
    }

    dispatch(
      updatePaymentStep({
        id: stepId,
        status: PaymentStepStatus.DONE,
      })
    )
  } catch (error) {
    let capturedError = detectWalletError(error)
    dispatch(
      updatePaymentStep({
        id: stepId,
        status: PaymentStepStatus.ERROR,
        error: capturedError,
      })
    )
    throw capturedError
  }
}

type Timeout = ReturnType<typeof setTimeout>
const watching: Map<string, Timeout> = new Map()
const POLL_INTERVAL = 5000

export const unwatch = (orderId) => () => {
  if (!watching.has(orderId)) return
  const timer = watching.get(orderId) as Timeout
  clearInterval(timer)
  watching.delete(orderId)
}

export const watchBityOrder = (orderId) => (dispatch, getState) => {
  if (watching.has(orderId)) return
  const jwsToken = getJWS(getState())

  function fetchNewData() {
    MooniAPI.getBityOrder(orderId, jwsToken)
      .then((orderDetails) => {
        if (!watching.has(orderId)) return

        if (orderDetails.orderStatus === BityOrderStatus.RECEIVED) {
          dispatch(
            updatePaymentStep({
              id: PaymentStepId.BITY,
              status: PaymentStepStatus.RECEIVED,
            })
          )
          log('PAYMENT: bity received')
          track('PAYMENT: bity received')
        } else if (orderDetails.orderStatus === BityOrderStatus.EXECUTED) {
          dispatch(unwatch(orderId))
          dispatch(
            updatePaymentStep({
              id: PaymentStepId.BITY,
              status: PaymentStepStatus.DONE,
            })
          )
          log('PAYMENT: bity executed')
          track('PAYMENT: bity executed')
        } else if (orderDetails.orderStatus === BityOrderStatus.CANCELLED) {
          dispatch(unwatch(orderId))
          dispatch(
            updatePaymentStep({
              id: PaymentStepId.BITY,
              status: PaymentStepStatus.ERROR,
              error: new Error('bity-order-cancelled'),
            })
          )
          dispatch(setPaymentStatus(PaymentStatus.ERROR))
          log('PAYMENT: bity cancelled')
          track('PAYMENT: bity cancelled')
        }
      })
      .catch((error) => logError('Error while fetching order state', error))
  }
  fetchNewData()
  watching.set(orderId, setInterval(fetchNewData, POLL_INTERVAL))
}

export const watchMooniOrder = (multiTradeId: string) => (dispatch, getState) => {
  if (watching.has(multiTradeId)) return
  const jwsToken = getJWS(getState())

  function fetchNewData() {
    MooniAPI.getOrder(multiTradeId, jwsToken)
      .then((mooniOrder) => {
        dispatch(setMooniOrder(mooniOrder))

        if (mooniOrder.status === MooniOrderStatus.CANCELLED) {
          dispatch(unwatch(multiTradeId))
        } else if (mooniOrder.status === MooniOrderStatus.EXECUTED) {
          dispatch(unwatch(multiTradeId))
          dispatch(setPaymentStatus(PaymentStatus.DONE))
          log('PAYMENT: mooni order ok')
          track('PAYMENT: mooni order ok')
          sendEvent('order_completed')
        }
      })
      .catch((error) => logError('Error while fetching mooni order', error))
  }
  fetchNewData()
  watching.set(multiTradeId, setInterval(fetchNewData, POLL_INTERVAL))
}

export const sendPayment = () =>
  async function (dispatch, getState) {
    const state = getState()
    const multiTrade = getMultiTrade(state)
    if (!multiTrade) throw new Error('Missing multitrade')

    dispatch(setPaymentStatus(PaymentStatus.ONGOING))

    const ethManager = getETHManager(state)

    const bityTrade = multiTrade.trades.find((t) => t.tradeType === TradeType.BITY) as BityTrade
    const dexTrade = multiTrade.trades.find((t) => t.tradeType === TradeType.DEX) as DexTrade

    const bityOrderId = bityTrade.bityOrderResponse.id
    log('PAYMENT: bity order id', bityOrderId)
    log('PAYMENT: ETH address', ethManager.getAddress())

    try {
      if (dexTrade) {
        if (!dexTrade.dexMetadata) throw new Error('missing dex meta data')

        // Allowance
        await dispatch(
          sendPaymentStep({
            stepId: PaymentStepId.ALLOWANCE,
            paymentFunction: async () => DexProxy.checkAndApproveAllowance(dexTrade, ethManager.provider),
          })
        )
        log('PAYMENT: allowance ok')
        track('PAYMENT: allowance ok')

        // Trade
        await dispatch(
          sendPaymentStep({
            stepId: PaymentStepId.TRADE,
            paymentFunction: async () => DexProxy.executeTrade(dexTrade, ethManager.provider),
          })
        )
        log('PAYMENT: trade ok')
        track('PAYMENT: trade ok')
      }

      // Payment
      const bityInputAmount = bityTrade.inputAmount
      const bityDepositAddress = bityTrade.bityOrderResponse.payment_details.crypto_address
      await dispatch(
        sendPaymentStep({
          stepId: PaymentStepId.PAYMENT,
          paymentFunction: async () => ethManager.send(bityDepositAddress, bityInputAmount).then((tx) => tx.hash),
        })
      )

      log('PAYMENT: payment ok')
      track('PAYMENT: payment ok')
      sendEvent('order_payment_executed')

      dispatch(
        updatePaymentStep({
          id: PaymentStepId.BITY,
          status: PaymentStepStatus.WAITING,
        })
      )
    } catch (error) {
      dispatch(setPaymentStatus(PaymentStatus.ERROR))
      await dispatch(cancelOrder()).catch(() => undefined)

      logError('Error while sending payment', error)

      if (error.message === 'user-rejected-transaction') {
        sendEvent('order_payment_refused')
      } else {
        sendEvent('order_payment_error', { message: error.message })
      }
    }
  }

export const initReferral = () =>
  async function (dispatch): Promise<boolean> {
    const query = new URLSearchParams(window.location.search)
    const referralId = query.get('referralId')

    if (referralId) {
      const valid = await MooniAPI.checkReferral(referralId);
      if(!valid) {
        throw new Error('invalid-referral-id');
      }
      dispatch(setReferral(referralId));

      // query.delete('referralId');
      // window.location.search = query.toString();
      return true;
    }
    return false;
  }

export const cancelOrder = () =>
  async function (dispatch, getState) {
    const state = getState()
    const multiTrade = getMultiTrade(state)
    if (!multiTrade) throw new Error('Missing multitrade')

    const jws = getJWS(state)
    await MooniAPI.cancelOrder(multiTrade.id, jws)
  }
