import * as actions from "./actions";

export const STATE_NAME = 'UI';

const initialState = {
  panelType: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case actions.SET_INFO_PANEL: {
      const { panelType } = action.payload;
      return {
        ...state,
        panelType,
      };
    }
    default:
      return state;
  }
}
