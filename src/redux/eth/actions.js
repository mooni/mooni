import Connect from '../../lib/connect';

export const SET_CONNECT = 'SET_CONNECT';
export const SET_ADDRESS = 'SET_ADDRESS';

export const setConnect = (connect) => ({
  type: SET_CONNECT,
  payload: {
    connect,
  }
});

export const setAddress = (address) => ({
  type: SET_ADDRESS,
  payload: {
    address,
  }
});

export const initConnect = () => function (dispatch)  {
  Connect.initWeb3().then(connect => {
    dispatch(setConnect(connect));
    dispatch(setAddress(connect.accounts[0]));
  }).catch(error => {
    console.error('Unable to connect to ethereum', error);
    dispatch(resetConnect());
  });
};

export const resetConnect = () => function (dispatch)  {
  dispatch(setConnect(null));
  dispatch(setAddress(null));
};
