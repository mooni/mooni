import React from 'react';

import AppContainer from './components/AppContainer';

import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import './App.css'
import RequireConnection from './components/RequireConnection';
import Login from './components/Login';
import PaymentPage from './pages/PaymentPage';
import ExchangePage from './pages/ExchangePage';

function App() {
  return (
    <AppContainer>
      <Login />
      <Switch>
        <Route path="/exchange">
          <ExchangePage />
        </Route>
        <Route path="/send">
          <RequireConnection eth><PaymentPage /></RequireConnection>
        </Route>
        <Route path="*">
          <Redirect to="/exchange" />
        </Route>
      </Switch>
    </AppContainer>
  );
}

export default App;
