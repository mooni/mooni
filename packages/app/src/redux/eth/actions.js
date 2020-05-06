import ETHManager from '../../lib/eth';
import { detectIframeWeb3Provider } from '../../lib/web3Providers';

import { getETHManager } from './selectors';
import { initBoxIfLoggedIn, resetBox } from '../box/actions';
import { logError } from '../../lib/log';

export const SET_ETH_MANAGER = 'SET_ETH_MANAGER';
export const SET_ETH_MANAGER_LOADING = 'SET_ETH_MANAGER_LOADING';
export const OPEN_LOGIN_MODAL = 'OPEN_LOGIN_MODAL';
export const SET_ADDRESS = 'SET_ADDRESS';
export const SET_PROVIDER_FROM_IFRAME = 'SET_PROVIDER_FROM_IFRAME';

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
export const setProviderFromIframe = (providerFromIframe) => ({
  type: SET_PROVIDER_FROM_IFRAME,
  payload: {
    providerFromIframe,
  }
});

export const resetETHManager = () => function (dispatch, getState) {
  const ethManager = getETHManager(getState());
  if(ethManager) {
    ethManager.close();
  }
  dispatch(setETHManager(null));
  dispatch(setAddress(null));
  dispatch(setETHManagerLoading(false));
  dispatch(setProviderFromIframe(false));
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

    dispatch(initBoxIfLoggedIn()).catch(error => logError('unable to enable box after login', error));

  } catch(error) {
    dispatch(resetETHManager());
    dispatch(setETHManagerLoading(false));

    if(error.message === 'eth_smart_account_not_supported') {
      throw new Error('eth_smart_account_not_supported');
    } else if(error.message === 'no_ethereum_provider') {
      throw new Error('no_ethereum_provider');
    } else if(error.message === 'eth_wrong_network_id') {
      throw new Error('eth_wrong_network_id');
    } else if(error.message === 'User closed WalletConnect modal') {
      return null;
    } else {
      logError('Unable to open ethereum wallet', error);
      throw new Error('unknown_error');
    }
  }
};

export const autoConnect = () => async (dispatch) => {
  dispatch(setETHManagerLoading(true));
  const initIframeProvider = await detectIframeWeb3Provider();
  if (initIframeProvider) {
    await dispatch(initETH('iframe'));
    dispatch(setProviderFromIframe(true));
  }
  dispatch(setETHManagerLoading(false));
};

export const logout = () => (dispatch) => {
  dispatch(resetETHManager());
  dispatch(resetBox());
};
