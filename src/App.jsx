import React from 'react';

import AppContainer from './components/AppContainer';

import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import './App.css'
import Login from './components/Login';
import PaymentPage from './pages/PaymentPage';
import ExchangePage from './pages/ExchangePage';
import StatusPage from './pages/StatusPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';

function App() {
  return (
    <AppContainer>
      <Login />
      <Switch>
        <Route path="/">
          <ExchangePage />
        </Route>
        <Route path="/send">
          <PaymentPage />
        </Route>
        <Route path="/status">
          <StatusPage />
        </Route>
        <Route path="/about">
          <AboutPage />
        </Route>
        <Route path="/terms">
          <TermsPage />
        </Route>
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </AppContainer>
  );
}

export default App;
