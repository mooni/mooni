import { selectProperty } from '../helpers';
import { STATE_NAME } from './reducer';

export const getETHManager = selectProperty([STATE_NAME, 'ethManager']);
export const getETHManagerLoading = selectProperty([STATE_NAME, 'ethManagerLoading']);
export const getLoginModalOpen = selectProperty([STATE_NAME, 'loginModalOpen']);
export const getModalError = selectProperty([STATE_NAME, 'modalError']);
export const getAddress = selectProperty([STATE_NAME, 'address']);
export const getProviderFromIframe = selectProperty([STATE_NAME, 'providerFromIframe']);
