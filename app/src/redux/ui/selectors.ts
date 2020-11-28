import { STATE_NAME } from './reducer';
import { RootState } from "../reducers";

export const getInputCurrencies = (state: RootState) => state[STATE_NAME].inputCurrencies;
export const getInfoPanel = (state: RootState) => state[STATE_NAME].panelType;
export const getModalError = (state: RootState) => state[STATE_NAME].modalError;
