import {addTokenFromAddress} from '../../lib/trading/currencyHelpers';
import {setTradeRequest} from '../payment/actions';
import {getMultiTradeRequest} from '../payment/selectors';

export const SET_INFO_PANEL = 'SET_INFO_PANEL';
export const SET_MODAL_ERROR = 'SET_MODAL_ERROR';

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

export const initTokens = () => async (dispatch, getState) => {
 dispatch(detectCustomToken());
};

export const detectCustomToken = () => async (dispatch, getState) => {
  const query = new URLSearchParams(window.location.search);
  const tokenAddress = query.get('token');

  if(tokenAddress) {
    addTokenFromAddress(tokenAddress).then(token => {
      const multiTradeRequest = getMultiTradeRequest(getState());
      if(multiTradeRequest) {
        dispatch(setTradeRequest({
          ...multiTradeRequest.tradeRequest,
          inputCurrencySymbol: token.symbol,
        }));
      }
    }).catch(e => {
      console.error(e);
      dispatch(setModalError(new Error('invalid-custom-token')))
    })
  }
};
