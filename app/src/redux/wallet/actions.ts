import ETHManager from '../../lib/eth';
import {setModalError} from '../ui/actions';
import {getAddress, getETHManager} from './selectors';
import {logError} from '../../lib/log';
import {detectIframeWeb3Provider, getWalletProvider, web3Modal} from '../../lib/web3Wallets';
import {MetaError} from '../../lib/errors';
import DIDManager from '../../lib/didManager';
import {store} from '../../lib/store';
import Api from '../../lib/api';
import {WalletStatus} from "./state";

export const SET_WALLET_STATUS = 'SET_WALLET_STATUS';
export const SET_ETH_MANAGER = 'SET_ETH_MANAGER';
export const SET_ADDRESS = 'SET_ADDRESS';
export const SET_JWS = 'SET_JWS';
export const SET_PROVIDER_FROM_IFRAME = 'SET_PROVIDER_FROM_IFRAME';

const setETHManager = (ethManager: ETHManager | null) => ({
  type: SET_ETH_MANAGER,
  payload: {
    ethManager,
  }
});

const setWalletStatus = (walletStatus: WalletStatus) => ({
  type: SET_WALLET_STATUS,
  payload: {
    walletStatus,
  }
});

const setAddress = (address: string | null) => ({
  type: SET_ADDRESS,
  payload: {
    address,
  }
});

export const setJWS = (jwsToken: string | null) => ({
  type: SET_JWS,
  payload: {
    jwsToken,
  }
});

const setProviderFromIframe = (providerFromIframe: boolean) => ({
  type: SET_PROVIDER_FROM_IFRAME,
  payload: {
    providerFromIframe,
  }
});

const onAccountChanged = () => (dispatch, getState) => {
  dispatch(setWalletStatus(WalletStatus.LOADING));

  const ethManager = getETHManager(getState());

  dispatch(setWalletStatus(WalletStatus.WAITING_SIGNATURE));
  DIDManager.getJWS(ethManager.provider)
      .then(async token => {
        dispatch(setWalletStatus(WalletStatus.LOADING));

        await Api.getUser(token);
        dispatch(setAddress(ethManager.getAddress()));
        dispatch(setJWS(token));

        dispatch(setWalletStatus(WalletStatus.CONNECTED));
      })
      .catch(() => dispatch(logout()));
};

export const login = (forcedProvider?) => async function (dispatch)  {
  try {

    dispatch(setWalletStatus(WalletStatus.CHOOSING_WALLET));
    const ethereum = forcedProvider || await web3Modal.connect();
    const ethManager = await ETHManager.create(ethereum);
    dispatch(setWalletStatus(WalletStatus.LOADING));
    dispatch(setETHManager(ethManager));

    const address = ethManager.getAddress();
    dispatch(setAddress(address));

    let jwsToken;
    try {
      dispatch(setWalletStatus(WalletStatus.WAITING_SIGNATURE));
      jwsToken = await DIDManager.getJWS(ethManager.provider);

      dispatch(setWalletStatus(WalletStatus.LOADING));
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

    dispatch(setWalletStatus(WalletStatus.CONNECTED));

  } catch(error) {
    dispatch(logout());

    if(error === "Modal closed by user") {
      return;
    } else if(error instanceof MetaError) {
      dispatch(setModalError(error));
    } else {
      logError('Unable to open ethereum wallet', error);
      dispatch(setModalError(
          new MetaError('unable_open_wallet', { error })
      ));
    }
  }
};

export const logout = () => (dispatch, getState) => {
  dispatch(setWalletStatus(WalletStatus.DISCONNECTING));

  const state = getState();

  const address = getAddress(state);
  if(address) {
    DIDManager.removeStore(address);
  }

  const ethManager = getETHManager(state);
  if(ethManager) {
    ethManager.close();
  }

  dispatch(setETHManager(null));
  dispatch(setAddress(null));
  dispatch(setJWS(null));
  dispatch(setProviderFromIframe(false));

  web3Modal.clearCachedProvider();

  // Temporary workaround to clean anything that could block re-logining
  store.clear();

  dispatch(setWalletStatus(WalletStatus.DISCONNECTED));
};

export const autoConnect = () => async (dispatch) => {
  const initIframeProvider = await detectIframeWeb3Provider();
  if (initIframeProvider) {
    dispatch(setWalletStatus(WalletStatus.LOADING));
    const ethereum = getWalletProvider('iframe');
    await dispatch(login(ethereum));
    dispatch(setProviderFromIframe(true));
  } else if(web3Modal.cachedProvider) {
    await dispatch(login());
  } else {
    dispatch(setWalletStatus(WalletStatus.DISCONNECTED));
  }
};
