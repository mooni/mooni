import * as actions from "./actions";

export const STATE_NAME = 'CONTACTS';

export const defaultAccount = { owner: {} };

const initialState = {
  myAccount: { ...defaultAccount },
  myAccountLoading: false,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case actions.SET_MY_ACCOUNT: {
      const { myAccount } = action.payload;
      return {
        ...state,
        myAccount: myAccount || defaultAccount,
      };
    }
    case actions.SET_MY_ACCOUNT_LOADING: {
      const { myAccountLoading } = action.payload;
      return {
        ...state,
        myAccountLoading,
      };
    }
    default:
      return state;
  }
}
