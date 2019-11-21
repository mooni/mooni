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
