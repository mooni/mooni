import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Main } from '@aragon/ui';

import './App.css';

import AppContainer from './components/AppContainer';
import Login from './components/Login';
import Routes from './Routes';

import store from './redux/store';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Main
          assetsUrl={`${process.env.PUBLIC_URL}/aragon-ui`}
          theme="light"
          layout={false}
          scrollView={false}
        >
          <AppContainer>
            <Login />
            <Routes/>
          </AppContainer>
        </Main>
      </Router>
    </Provider>
  );
}
