import ETHManager from '../../lib/eth';

import { getETHManager } from './selectors';
import { initBoxIfLoggedIn } from '../box/actions';

export const SET_ETH_MANAGER = 'SET_ETH_MANAGER';
export const SET_ADDRESS = 'SET_ADDRESS';
export const SET_DEBUG = 'SET_DEBUG';

export const setETHManager = (ethManager) => ({
  type: SET_ETH_MANAGER,
  payload: {
    ethManager,
  }
});

export const setAddress = (address) => ({
  type: SET_ADDRESS,
  payload: {
    address,
  }
});
export const setDebug = (debug) => ({
  type: SET_DEBUG,
  payload: {
    debug,
  }
});

export const resetETHManager = () => function (dispatch, getState) {
  const ethManager = getETHManager(getState());
  if(ethManager) {
    ethManager.close();
  }
  dispatch(setETHManager(null));
  dispatch(setAddress(null));
};

export const initETH = () => async function (dispatch)  {
  try {
    const ethManager = await ETHManager.createETHManager();
    dispatch(setETHManager(ethManager));
    ethManager.on('accountsChanged', () => {
      dispatch(setAddress(ethManager.getAddress()));
    });
    dispatch(setAddress(ethManager.getAddress()));
  } catch(error) {
    console.error('Unable to connect to ethereum', error);
    dispatch(resetETHManager());
    dispatch(setDebug(error.message));
  }

  await dispatch(initBoxIfLoggedIn());
};
