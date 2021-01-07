import { RootState } from '../store';
import { STATE_NAME } from './state';

export const getETHManager = (state: RootState) => state[STATE_NAME].ethManager;
export const getWalletLoading = (state: RootState) => state[STATE_NAME].walletLoading;
export const getAddress = (state: RootState) => state[STATE_NAME].address;
export const getJWS = (state: RootState) => state[STATE_NAME].jwsToken;
export const getProviderFromIframe = (state: RootState) => state[STATE_NAME].providerFromIframe;
