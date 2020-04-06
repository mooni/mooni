import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
} from 'react-router-dom';
import { Provider } from 'react-redux'
import { Main } from '@aragon/ui';

import App from './App';

import * as serviceWorker from './serviceWorker';

import store from './redux/store'

const Root = (
  <Provider store={store}>
    <Router>
      <Main
        assetsUrl={`${process.env.PUBLIC_URL}/aragon-ui`}
        theme="light"
        layout={false}
        scrollView={false}
      >
        <App />
      </Main>
    </Router>
  </Provider>
);

ReactDOM.render(Root, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
