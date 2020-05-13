import { selectProperty } from '../helpers';
import { STATE_NAME } from './reducer';
import { IState } from './reducer';

export const getInputCurrencies: (state: IState) => object = selectProperty([STATE_NAME, 'inputCurrencies']);
export const getInfoPanel: (state: IState) => string = selectProperty([STATE_NAME, 'panelType']);
export const getModalError: (state: IState) => Error = selectProperty([STATE_NAME, 'modalError']);
