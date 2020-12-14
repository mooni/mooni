import React, { useEffect } from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Main } from '@aragon/ui';
import { ThemeProvider } from '@material-ui/core';
import { theme } from './theme';

import './App.css';

import AppContainer from './components/AppContainer';
import InfoPanel from './components/InfoPanel';
import ErrorModal from './components/ErrorModal';
import WalletModal from './components/WalletModal';
import Routes from './Routes';

import { store } from './redux/store';
import { autoConnect } from './redux/eth/actions';
import { initTokens } from './redux/ui/actions';


export default function App() {
  useEffect(() => {
    store.dispatch(autoConnect()).catch(console.error);
    store.dispatch(initTokens());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Main
          assetsUrl={`${process.env.PUBLIC_URL}/aragon-ui`}
          theme="light"
          layout={false}
          scrollView={false}
        >
          <ThemeProvider theme={theme}>
            <AppContainer>
              <InfoPanel />
              <WalletModal />
              <ErrorModal />
              <Routes/>
            </AppContainer>
          </ThemeProvider>
        </Main>
      </Router>
    </Provider>
  );
}
