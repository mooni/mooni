import { selectProperty } from '../helpers';
import { STATE_NAME } from './reducer';

export const getInfoPanel = selectProperty([STATE_NAME, 'panelType']);
export const getModalError = selectProperty([STATE_NAME, 'modalError']);
