import * as actions from "./actions";

export const STATE_NAME = 'UI';

export interface IState {
  panelType?: string;
  modalError?: Error;

}
const initialState: IState = {
  panelType: undefined,
  modalError: undefined,
};

export default function(state: IState = initialState, action: any) {
  switch (action.type) {
    case actions.SET_INFO_PANEL: {
      const { panelType }: { panelType: string } = action.payload;
      return {
        ...state,
        panelType,
      };
    }
    case actions.SET_MODAL_ERROR: {
      const { error }: { error: Error } = action.payload;
      return {
        ...state,
        modalError: error,
      };
    }
    default:
      return state;
  }
}
