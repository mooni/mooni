import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import LogRocket from 'logrocket';

import rootReducer from "./reducers";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(
  applyMiddleware(thunk, LogRocket.reduxMiddleware()),
);

export default createStore(rootReducer, enhancer);
