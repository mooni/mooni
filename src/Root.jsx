import React from 'react';
import {
  BrowserRouter,
  MemoryRouter,
} from 'react-router-dom';

import App from './App';
import WidgetApp from './WidgetApp';

import { Provider } from 'react-redux'
import store from './redux/store'

export default function Root(props = {}) {
  const Router = props.widget ? MemoryRouter : BrowserRouter;
  const InApp = props.widget ? WidgetApp : App;
  return (
    <Provider store={store}>
      <Router>
        <InApp {...props} />
      </Router>
    </Provider>
  );
}
