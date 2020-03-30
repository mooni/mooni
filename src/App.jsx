import React from 'react';

import AppContainer from './components/AppContainer';

import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import { usePageViews } from './lib/analytics';

import './App.css'
import Login from './components/Login';
import HomePage from './pages/HomePage';
import ExchangePage from './pages/ExchangePage';
import StatusPage from './pages/StatusPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';

function App() {
  usePageViews();

  return (
    <AppContainer>
      <Login />
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <Route path="/exchange">
          <ExchangePage />
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
