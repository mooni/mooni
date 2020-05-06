import * as actions from "./actions";

export const STATE_NAME = 'UI';

const initialState = {
  panelType: null,
  modalError: null,
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
    case actions.SET_MODAL_ERROR: {
      const { error } = action.payload;
      return {
        ...state,
        modalError: error,
      };
    }
    default:
      return state;
  }
}
