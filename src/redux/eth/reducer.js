import * as actions from "./actions";

export const STATE_NAME = 'ETH';

const initialState = {
  connect: null,
  address: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case actions.SET_CONNECT: {
      const { connect } = action.payload;
      return {
        ...state,
        connect,
      };
    }
    case actions.SET_ADDRESS: {
      const { address } = action.payload;
      return {
        ...state,
        address,
      };
    }
    default:
      return state;
  }
}
