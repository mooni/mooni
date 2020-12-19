import React, { useEffect } from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { Main as AragonUI } from '@aragon/ui';
import { ThemeProvider as MUIThemeProvider } from '@material-ui/core';
import { theme } from './theme';

import './App.css';

import AppContainer from './components/AppContainer';
import InfoPanel from './components/InfoPanel';
import ErrorModal from './components/ErrorModal';
import WalletModal from './components/WalletModal';
import { Routes } from './Routes';

import { store } from './redux/store';
import { autoConnect } from './redux/eth/actions';
import { initTokens } from './redux/ui/actions';

export const App: React.FC = () => {
  useEffect(() => {
    store.dispatch(autoConnect());
    store.dispatch(initTokens());
  }, []);

  return (
    <ReduxProvider store={store}>
      <Router>
        <AragonUI
          assetsUrl={`${process.env.PUBLIC_URL}/aragon-ui`}
          theme="light"
          layout={false}
          scrollView={false}
        >
          <MUIThemeProvider theme={theme}>
            <AppContainer>
              <InfoPanel />
              <WalletModal />
              <ErrorModal />
              <Routes/>
            </AppContainer>
          </MUIThemeProvider>
        </AragonUI>
      </Router>
    </ReduxProvider>
  );
}
