import React from 'react';
import {
  BrowserRouter,
  MemoryRouter,
} from 'react-router-dom';

import App from './App';

import { Provider } from 'react-redux'
import store from './redux/store'

export default function Root(props = {}) {
  const Router = props.widget ? MemoryRouter : BrowserRouter;
  return (
    <Provider store={store}>
      <Router>
        <App {...props} />
      </Router>
    </Provider>
  );
}
