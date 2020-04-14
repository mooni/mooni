import React from 'react';

import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import './App.css';

import HomePage from './pages/HomePage';
import ExchangePage from './pages/ExchangePage';
import StatusPage from './pages/StatusPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';

import { usePageViews } from './lib/analytics';

export default function Routes() {
  usePageViews();

  return (
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
  );
}
