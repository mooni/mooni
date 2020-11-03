import ETHManager from '../../lib/eth';
import { detectIframeWeb3Provider } from '../../lib/web3Providers';

import { setModalError } from '../ui/actions';
import { getETHManager } from './selectors';
import { initBoxIfLoggedIn, resetBox } from '../box/actions';
import { logError } from '../../lib/log';
import { web3Modal, getWalletProvider } from '../../lib/web3Providers';
import { MetaError } from '../../lib/errors';
import DIDManager from '../../lib/didManager';

export const SET_ETH_MANAGER = 'SET_ETH_MANAGER';
export const SET_ETH_MANAGER_LOADING = 'SET_ETH_MANAGER_LOADING';
export const OPEN_LOGIN_MODAL = 'OPEN_LOGIN_MODAL';
export const SET_ADDRESS = 'SET_ADDRESS';
export const SET_JWS = 'SET_JWS';
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

export const setJWS = (jwsToken) => ({
  type: SET_JWS,
  payload: {
    jwsToken,
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
  dispatch(setJWS(null));
  dispatch(setETHManagerLoading(false));
  dispatch(setProviderFromIframe(false));
};

export const initETH = (ethereum) => async function (dispatch)  {
  dispatch(setETHManagerLoading(true));
  try {

    const ethManager = new ETHManager(ethereum);
    await ethManager.init();

    const address = ethManager.getAddress();
    const token = await DIDManager.getJWS(ethManager.provider);

    dispatch(setETHManager(ethManager));
    dispatch(setAddress(address));
    dispatch(setJWS(token));
    dispatch(setETHManagerLoading(false));

    ethManager.on('accountsChanged', () => {
      dispatch(setAddress(ethManager.getAddress()));
      // TODO const token = await DIDManager.getJWS(ethManager.provider);
    });
    ethManager.on('stop', () => {
      dispatch(logout());
    });

    dispatch(initBoxIfLoggedIn()).catch(error => logError('unable to enable box after login', error));

  } catch(error) {
    dispatch(logout());

    if(error.message === 'eth_smart_account_not_supported' || error.message === 'eth_wrong_network_id') {
      throw error;
    } else {
      logError('Unable to open ethereum wallet', error);
      throw new MetaError('unable_open_wallet', { error });
    }
  }
};

export const openWeb3Modal = () => async (dispatch) => {
  try {
    const ethereum = await web3Modal.connect();
    await dispatch(initETH(ethereum));
  } catch(error) {
    if(error === "Modal closed by user") return;
    dispatch(setModalError(error));
  }
};

export const autoConnect = () => async (dispatch) => {
  dispatch(setETHManagerLoading(true));
  const initIframeProvider = await detectIframeWeb3Provider();
  if (initIframeProvider) {
    const ethereum = getWalletProvider('iframe');
    await dispatch(initETH(ethereum));
    dispatch(setProviderFromIframe(true));
  } else if(web3Modal.cachedProvider) {
    await dispatch(openWeb3Modal());
  }
  dispatch(setETHManagerLoading(false));
};

export const logout = () => (dispatch) => {
  web3Modal.clearCachedProvider();
  dispatch(resetETHManager());
  dispatch(resetBox());
};
