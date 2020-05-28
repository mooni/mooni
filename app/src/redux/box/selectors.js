// import { createSelector } from 'reselect';
import { selectProperty } from '../helpers';
import { STATE_NAME } from './reducer';

export const getBoxManager = selectProperty([STATE_NAME, 'boxManager']);
export const getBoxLoading = selectProperty([STATE_NAME, 'boxLoading']);
