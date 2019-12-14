import { createSelector } from 'reselect';
import { selectProperty } from '../helpers';
import { STATE_NAME } from './reducer';

export const getETHManager = selectProperty([STATE_NAME, 'ethManager']); // TODO rename
export const getETHManagerLoading = selectProperty([STATE_NAME, 'ethManagerLoading']); // TODO rename
export const getLoginModalOpen = selectProperty([STATE_NAME, 'loginModalOpen']); // TODO rename
export const getAddress = selectProperty([STATE_NAME, 'address']);
export const getDebug = selectProperty([STATE_NAME, 'debug']);
export const isLogged = createSelector(getAddress, address => !!address);
