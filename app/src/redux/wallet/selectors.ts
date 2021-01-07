import { STATE_NAME } from './state';
import { RootState } from '../store';

export const getETHManager = (state: RootState) => state[STATE_NAME].ethManager;
export const getETHManagerLoading = (state: RootState) => state[STATE_NAME].ethManagerLoading;
export const getAddress = (state: RootState) => state[STATE_NAME].address;
export const getJWS = (state: RootState) => state[STATE_NAME].jwsToken;
export const getProviderFromIframe = (state: RootState) => state[STATE_NAME].providerFromIframe;
