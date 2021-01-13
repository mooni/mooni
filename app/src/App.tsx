import React, { useEffect } from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { Main as AragonUI } from '@aragon/ui';
import { ThemeProvider as MUIThemeProvider } from '@material-ui/core';
import { theme } from './theme';

import './App.css';

import AppContainer from './components/UI/AppContainer';
import InfoPanel from './components/Modals/InfoPanel';
import ErrorModal from './components/Modals/ErrorModal';
import WalletModal from './components/Modals/WalletModal';
import { Routes } from './Routes';

import { store } from './redux/store';
import { initReferral } from './redux/payment/actions';
import { autoConnect } from './redux/wallet/actions';
import { initTokens } from './redux/ui/actions';

export const App: React.FC = () => {
  useEffect(() => {
    store.dispatch(autoConnect());
    store.dispatch(initTokens());
    store.dispatch(initReferral());
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
