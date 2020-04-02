import ETHManager from '../../lib/eth';

import { getETHManager } from './selectors';
import { initBoxIfLoggedIn, resetBox } from '../box/actions';

export const SET_ETH_MANAGER = 'SET_ETH_MANAGER';
export const SET_ETH_MANAGER_LOADING = 'SET_ETH_MANAGER_LOADING';
export const OPEN_LOGIN_MODAL = 'OPEN_LOGIN_MODAL';
export const SET_ADDRESS = 'SET_ADDRESS';

export const setETHManager = (ethManager) => ({
  type: SET_ETH_MANAGER,
  payload: {
    ethManager,
  }
});

export const setETHManagerLoading = (ethManagerLoading) => ({
  type: SET_ETH_MANAGER_LOADING,
  payload: {
    ethManagerLoading,
  }
});

export const openLoginModal = (loginModalOpen = true) => ({
  type: OPEN_LOGIN_MODAL,
  payload: {
    loginModalOpen,
  }
});

export const setAddress = (address) => ({
  type: SET_ADDRESS,
  payload: {
    address,
  }
});

export const resetETHManager = () => async function (dispatch, getState) {
  const ethManager = getETHManager(getState());
  if(ethManager) {
    ethManager.close();
  }
  dispatch(setETHManager(null));
  dispatch(setAddress(null));
  dispatch(setETHManagerLoading(false));
};

export const initETH = (walletType) => async function (dispatch)  {
  dispatch(setETHManagerLoading(true));
  try {
    const ethManager = await ETHManager.createETHManager(walletType);
    dispatch(setETHManager(ethManager));
    dispatch(setAddress(ethManager.getAddress()));
    dispatch(setETHManagerLoading(false));

    ethManager.on('accountsChanged', () => {
      dispatch(setAddress(ethManager.getAddress()));
    });
    ethManager.on('stop', () => {
      dispatch(resetETHManager());
    });

    dispatch(initBoxIfLoggedIn()).catch(console.error);

    return null;
  } catch(error) {
    dispatch(resetETHManager());
    dispatch(setETHManagerLoading(false));
    console.error('Unable to connect to ethereum', error);
    if(error.message === 'eth_smart_account_not_supported') {
      return 'eth_smart_account_not_supported';
    } else if(error.message === 'no_ethereum_provider') {
      return 'no_ethereum_provider';
    } else if(error.message === 'User closed WalletConnect modal') {
      return null;
    } else {
      return 'unknown_error';
    }
  }
};

export const logout = () => (dispatch) => {
  dispatch(resetETHManager());
  dispatch(resetBox());
};
