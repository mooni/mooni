import { ETH, TOKENS, addToken } from '../../lib/currencies';
import { setRateRequest } from '../payment/actions';
import { getRateRequest } from '../payment/selectors';

export const SET_INPUT_CURRENCIES = 'SET_INPUT_CURRENCIES';
export const SET_INFO_PANEL = 'SET_INFO_PANEL';
export const SET_MODAL_ERROR = 'SET_MODAL_ERROR';

export const setInputCurrencies = (inputCurrencies) => ({
  type: SET_INPUT_CURRENCIES,
  payload: {
    inputCurrencies,
  }
});

export const setInfoPanel = (panelType) => ({
  type: SET_INFO_PANEL,
  payload: {
    panelType,
  }
});

export const setModalError = (error) => ({
  type: SET_MODAL_ERROR,
  payload: {
    error,
  }
});

export const initTokens = () => (dispatch, getState) => {
  dispatch(setInputCurrencies([ETH].concat(Object.keys(TOKENS))));

  const query = new URLSearchParams(window.location.search);
  const token = query.get('token');

  if(token) {
    addToken(token).then(addedToken => {
      dispatch(setInputCurrencies([ETH].concat(Object.keys(TOKENS))));
      const rateRequest = getRateRequest(getState());
      dispatch(setRateRequest({
        ...rateRequest,
        inputCurrency: addedToken[0],
      }));
    }).catch(() => {
      dispatch(setModalError(new Error('invalid-custom-token')))
    })
  }
};
