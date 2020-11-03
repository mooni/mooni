import * as actions from "./actions";

export const STATE_NAME = 'ETH';

const initialState = {
  ethManager: null,
  address: null,
  jwsToken: null,
  loginModalOpen: false,
  providerFromIframe: false,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case actions.SET_ETH_MANAGER: {
      const { ethManager } = action.payload;
      return {
        ...state,
        ethManager,
      };
    }
    case actions.SET_ETH_MANAGER_LOADING: {
      const { ethManagerLoading } = action.payload;
      return {
        ...state,
        ethManagerLoading,
      };
    }
    case actions.OPEN_LOGIN_MODAL: {
      const { loginModalOpen } = action.payload;
      return {
        ...state,
        loginModalOpen,
      };
    }
    case actions.SET_ADDRESS: {
      const { address } = action.payload;
      return {
        ...state,
        address,
      };
    }
    case actions.SET_JWS: {
      const { jwsToken } = action.payload;
      return {
        ...state,
        jwsToken,
      };
    }
    case actions.SET_PROVIDER_FROM_IFRAME: {
      const { providerFromIframe } = action.payload;
      return {
        ...state,
        providerFromIframe,
      };
    }
    default:
      return state;
  }
}
