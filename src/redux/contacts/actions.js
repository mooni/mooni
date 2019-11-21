export const SET_MY_ACCOUNT = 'SET_MY_ACCOUNT';

export const setMyAccount = (myAccount) => ({
  type: SET_MY_ACCOUNT,
  payload: {
    myAccount,
  }
});
