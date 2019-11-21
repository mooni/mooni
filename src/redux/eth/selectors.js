import { createSelector } from 'reselect';
import { selectProperty } from '../helpers';
import { STATE_NAME } from './reducer';

export const getConnect = selectProperty([STATE_NAME, 'connect']);
export const getAddress = selectProperty([STATE_NAME, 'address']);
export const isLogged = createSelector(getAddress, address => !!address);
