import * as actions from "./actions";

export const STATE_NAME = 'ETH';

const initialState = {
  ethManager: null,
  address: null,
  loginModalOpen: false,
  debug: null,
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
    case actions.SET_DEBUG: {
      const { debug } = action.payload;
      return {
        ...state,
        debug,
      };
    }
    default:
      return state;
  }
}
