import * as actions from "./actions";

export const STATE_NAME = 'BOX';

const initialState = {
  boxManager: null,
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
    default:
      return state;
  }
}
