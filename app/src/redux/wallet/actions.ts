import ETHManager from '../../lib/eth';
import {setModalError} from '../ui/actions';
import {getAddress, getETHManager} from './selectors';
import {logError} from '../../lib/log';
import { web3Modal } from '../../lib/web3Wallets';
import {MetaError} from '../../lib/errors';
import DIDManager from '../../lib/didManager';
import {store} from '../../lib/store';
import {WalletStatus} from "./state";
import { fetchUser, resetUser } from '../user/userSlice';
import { identify } from '../../lib/analytics';
import { detectIframeWeb3Provider } from '../../lib/iFrameProvider';

export const SET_WALLET_STATUS = 'SET_WALLET_STATUS';
export const SET_ETH_MANAGER = 'SET_ETH_MANAGER';
export const SET_ADDRESS = 'SET_ADDRESS';
export const SET_JWS = 'SET_JWS';
export const SET_PROVIDER_FROM_IFRAME = 'SET_PROVIDER_FROM_IFRAME';

const setETHManager = (ethManager: ETHManager | null) => ({
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

const setAddress = (address: string | null) => ({
  type: SET_ADDRESS,
  payload: {
    address,
  }
});

export const setJWS = (jwsToken: string | null) => ({
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
  dispatch(resetUser());

  const ethManager = getETHManager(getState());

  dispatch(setWalletStatus(WalletStatus.WAITING_SIGNATURE));
  DIDManager.getJWS(ethManager.provider)
    .then(async token => {
      dispatch(setWalletStatus(WalletStatus.LOADING));
      dispatch(setJWS(token));
      await dispatch(fetchUser());

      const address = ethManager.getAddress()
      dispatch(setAddress(address));
      identify(address);

      dispatch(setWalletStatus(WalletStatus.CONNECTED));
    })
    .catch(error => {
      dispatch(logout());

      if(error.code === 4001) {
        dispatch(setModalError(
          new MetaError('eth_signature_rejected')
        ));
      } else if(error instanceof MetaError) {
        logError('Unable to authenticate ethereum wallet (meta)', error);
        dispatch(setModalError(error));
      } else {
        logError('Unable to authenticate ethereum wallet', error);
        dispatch(setModalError(
          new MetaError('unable_open_wallet', { error })
        ));
      }
    });
};

export const login = (ethereum?) => async function (dispatch)  {
  try {

    if(!ethereum) {
      dispatch(setWalletStatus(WalletStatus.CHOOSING_WALLET));
      ethereum = await web3Modal.connect();
    }
    dispatch(setWalletStatus(WalletStatus.LOADING));
    const ethManager = await ETHManager.create(ethereum);
    dispatch(setETHManager(ethManager));

    ethManager.events.on('stop', () => {
      dispatch(logout());
    });

    ethManager.events.on('accountsChanged', () => {
      dispatch(onAccountChanged());
    });

    await dispatch(onAccountChanged());

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
  dispatch(resetUser());

  web3Modal.clearCachedProvider();

  // Temporary workaround to clean anything that could block re-logining
  store.clear();

  dispatch(setWalletStatus(WalletStatus.DISCONNECTED));
};

export const autoConnect = () => async (dispatch) => {
  dispatch(setWalletStatus(WalletStatus.LOADING));
  const iFrameProvider = await detectIframeWeb3Provider();
  if(iFrameProvider) {
    await dispatch(login(iFrameProvider));
    dispatch(setProviderFromIframe(true));
    return;
  }
  if (web3Modal.cachedProvider) {
    await dispatch(login());
  } else {
    dispatch(setWalletStatus(WalletStatus.DISCONNECTED));
  }
};
