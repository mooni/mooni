import * as actions from './actions'
import { STATE_NAME, initialState } from './state'

export { STATE_NAME }

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_ETH_MANAGER: {
      const { ethManager } = action.payload
      return {
        ...state,
        ethManager,
      }
    }
    case actions.SET_WALLET_STATUS: {
      const { walletStatus } = action.payload
      return {
        ...state,
        walletStatus,
      }
    }
    case actions.SET_ADDRESS: {
      const { address } = action.payload
      return {
        ...state,
        address,
      }
    }
    case actions.SET_JWS: {
      const { jwsToken } = action.payload
      return {
        ...state,
        jwsToken,
      }
    }
    case actions.SET_PROVIDER_FROM_IFRAME: {
      const { providerFromIframe } = action.payload
      return {
        ...state,
        providerFromIframe,
      }
    }
    default:
      return state
  }
}
