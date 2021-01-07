import ETHManager from '../../lib/eth';
import { setModalError } from '../ui/actions';
import { getETHManager, getAddress } from './selectors';
import { logError } from '../../lib/log';
import { detectIframeWeb3Provider, web3Modal, getWalletProvider } from '../../lib/web3Wallets';
import { MetaError } from '../../lib/errors';
import DIDManager from '../../lib/didManager';
import { store } from '../../lib/store';
import Api from '../../lib/api';

export const SET_ETH_MANAGER = 'SET_ETH_MANAGER';
export const SET_WALLET_LOADING = 'SET_WALLET_LOADING';
export const SET_ADDRESS = 'SET_ADDRESS';
export const SET_JWS = 'SET_JWS';
export const SET_PROVIDER_FROM_IFRAME = 'SET_PROVIDER_FROM_IFRAME';

const setETHManager = (ethManager) => ({
  type: SET_ETH_MANAGER,
  payload: {
    ethManager,
  }
});

const setWalletLoading = (walletLoading) => ({
  type: SET_WALLET_LOADING,
  payload: {
    walletLoading,
  }
});

const setAddress = (address) => ({
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

const setProviderFromIframe = (providerFromIframe) => ({
  type: SET_PROVIDER_FROM_IFRAME,
  payload: {
    providerFromIframe,
  }
});

const onAccountChanged = () => (dispatch, getState) => {
  const ethManager = getETHManager(getState());

  dispatch(setWalletLoading(true));

  DIDManager.getJWS(ethManager.provider)
    .then(async token => {
      await Api.getUser(token);
      dispatch(setAddress(ethManager.getAddress()));
      dispatch(setJWS(token));
      dispatch(setWalletLoading(false));
    })
    .catch(() => dispatch(logout()));
};

const initWallet = (ethereum) => async function (dispatch)  {
  dispatch(setWalletLoading(true));
  try {

    const ethManager = await ETHManager.create(ethereum);

    const address = ethManager.getAddress();
    let jwsToken;
    try {
      jwsToken = await DIDManager.getJWS(ethManager.provider);
      await Api.getUser(jwsToken);
      dispatch(setJWS(jwsToken));
    } catch(error) {
      DIDManager.removeStore(address);
      if(error.code === 4001) {
        throw new MetaError('eth_signature_rejected');
      } else {
        throw error;
      }
    }

    dispatch(setETHManager(ethManager));
    dispatch(setAddress(address));
    dispatch(setWalletLoading(false));

    ethManager.events.on('accountsChanged', () => {
      dispatch(onAccountChanged());
    });
    ethManager.events.on('stop', () => {
      dispatch(logout());
    });

  } catch(error) {
    dispatch(logout());

    if(error instanceof MetaError) {
      throw error;
    } else {
      logError('Unable to open ethereum wallet', error);
      throw new MetaError('unable_open_wallet', { error });
    }
  }
};


export const login = () => async (dispatch) => {
  try {
    const ethereum = await web3Modal.connect();
    await dispatch(initWallet(ethereum));
  } catch(error) {
    if(error === "Modal closed by user") return;
    dispatch(setModalError(error));
  }
};

export const logout = () => (dispatch, getState) => {
  const ethManager = getETHManager(getState());
  if(ethManager) {
    ethManager.close();
  }

  dispatch(setETHManager(null));
  dispatch(setWalletLoading(false));
  dispatch(setAddress(null));
  dispatch(setJWS(null));
  dispatch(setProviderFromIframe(false));

  const address = getAddress(getState());
  if(address) {
    DIDManager.removeStore(address);
  }

  web3Modal.clearCachedProvider();

  store.clear();
};

export const autoConnect = () => async (dispatch) => {
  dispatch(setWalletLoading(true));
  const initIframeProvider = await detectIframeWeb3Provider();
  if (initIframeProvider) {
    const ethereum = getWalletProvider('iframe');
    await dispatch(initWallet(ethereum));
    dispatch(setProviderFromIframe(true));
  } else if(web3Modal.cachedProvider) {
    await dispatch(login());
  }
  dispatch(setWalletLoading(false));
};
