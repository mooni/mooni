import { getBoxManager } from '../box/selectors';

export const SET_MY_ACCOUNT = 'SET_MY_ACCOUNT';

export const setMyAccount = (myAccount) => ({
  type: SET_MY_ACCOUNT,
  payload: {
    myAccount,
  }
});

export const fetchMyAccount = () => async function (dispatch, getState)  {
  const boxManager = getBoxManager(getState());

  const name = await boxManager.getPrivate('name');
  dispatch(setMyAccount({
    name: name,
  }));
};
