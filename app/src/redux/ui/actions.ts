import {addTokenFromAddress, replaceTokens, getCurrenciesSymbols} from '../../lib/trading/currencyHelpers';
import {ETHER} from '../../lib/trading/currencyList';
import {setTradeRequest} from '../payment/actions';
import {getMultiTradeRequest} from '../payment/selectors';
import {CurrencyType} from "../../lib/trading/currencyTypes";
import ParaswapWrapper from "../../lib/wrappers/paraswap";

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

export const initTokens = () => async (dispatch, getState) => {
 dispatch(initTokenFromDefaultList());
 // dispatch(initTokenFromParaswap());
 dispatch(detectCustomToken());
};

export const initTokenFromDefaultList = () => async (dispatch, getState) => {
  const tokenSymbols = getCurrenciesSymbols(CurrencyType.ERC20);
  const inputCurrencies = [ETHER.symbol].concat(tokenSymbols);
  dispatch(setInputCurrencies(inputCurrencies));
};

export const detectCustomToken = () => async (dispatch, getState) => {
  const query = new URLSearchParams(window.location.search);
  const tokenAddress = query.get('token');

  if(tokenAddress) {
    addTokenFromAddress(tokenAddress).then(token => {
      const tokenSymbols = getCurrenciesSymbols(CurrencyType.ERC20);
      dispatch(setInputCurrencies([ETHER.symbol].concat(tokenSymbols)));
      const multiTradeRequest = getMultiTradeRequest(getState());
      if(multiTradeRequest) {
        dispatch(setTradeRequest({
          ...multiTradeRequest.tradeRequest,
          inputCurrency: token,
        }));
      }
    }).catch(() => {
      dispatch(setModalError(new Error('invalid-custom-token')))
    })
  }
};

export const initTokenFromParaswap = () => async (dispatch, getState) => {
  const pTokens = await ParaswapWrapper.getTokenList();
  replaceTokens(pTokens);
  const tokenSymbols = getCurrenciesSymbols(CurrencyType.ERC20);
  const inputCurrencies = [ETHER.symbol].concat(tokenSymbols);
  dispatch(setInputCurrencies(inputCurrencies));
};
