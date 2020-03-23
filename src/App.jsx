import React from 'react';

import AppContainer from './components/AppContainer';

import { Box, Container } from '@material-ui/core'
import { Main, Header, Tag } from '@aragon/ui'

import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import './App.css'
import RequireConnection from './components/RequireConnection';
import Account from './components/Account';
import Login from './components/Login';
import MyAccountPage from './pages/MyAccountPage';
import PaymentPage from './pages/PaymentPage';
import ExchangePage from './pages/ExchangePage';
import Welcome from './pages/Welcome';

function App() {
  return (
    <AppContainer>
      <Switch>
        <Route exact path="/">
          <Welcome />
        </Route>
        <Route path="/exchange">
          <ExchangePage />
        </Route>
        <Route path="/my-account">
          <RequireConnection eth box><MyAccountPage /></RequireConnection>
        </Route>
        <Route path="/send">
          <RequireConnection eth><PaymentPage /></RequireConnection>
        </Route>
        <Route path="/send">
          <Redirect to="/send/0" />
        </Route>
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </AppContainer>
  );
}

export default App;
