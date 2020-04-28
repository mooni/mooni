import * as actions from "./actions";

export const STATE_NAME = 'BOX';

const initialState = {
  boxManager: null,
  boxLoading: false,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case actions.SET_BOX_MANAGER: {
      const { boxManager } = action.payload;
      return {
        ...state,
        boxManager,
      };
    }
    case actions.SET_BOX_LOADING: {
      const { boxLoading } = action.payload;
      return {
        ...state,
        boxLoading,
      };
    }
    default:
      return state;
  }
}
