import * as actions from "./actions";

export const STATE_NAME = 'CONTACTS';

const initialState = {
  myAccount: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case actions.SET_MY_ACCOUNT: {
      const { myAccount } = action.payload;
      return {
        ...state,
        myAccount,
      };
    }
    default:
      return state;
  }
}
