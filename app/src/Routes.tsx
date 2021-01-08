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
import ProfilePage from './pages/ProfilePage';

import { usePageViews } from './lib/analytics';

export const Routes: React.FC = () => {
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
      <Route path="/profile">
        <ProfilePage />
      </Route>
      <Route path="*">
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
