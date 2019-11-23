import React from 'react';

import { Container } from '@material-ui/core'
import { Main, Header, Tag } from '@aragon/ui'

import {
  Switch,
  Route,
  Redirect,
  useLocation,
  useHistory
} from 'react-router-dom';

import './App.css'
import RequireConnection from './components/RequireConnection';
import Account from './components/Account';
import MyAccountPage from './pages/MyAccountPage';
import PaymentPage from './pages/PaymentPage';
import Welcome from './pages/Welcome';
import Contacts from './pages/ContactsPage';

function App() {
  const location = useLocation();
  const history = useHistory();

  const pageName = location.pathname && location.pathname !== '/' ? location.pathname.substring(1) : null;

  return (
    <Main>
      <Header
        primary={
          <>
            <div onClick={() => history.push('/')} style={{cursor: 'pointer'}}>Crypto Off-Ramp</div>
          {pageName && <Tag mode="identifier">{pageName}</Tag>}
          </>
        }
        secondary={<Account />}
      />
      <Container maxWidth="md">
        <Switch>
          <Route exact path="/">
            <Welcome />
          </Route>
          <Route path="/my-account">
            <RequireConnection eth box><MyAccountPage /></RequireConnection>
          </Route>
          <Route path="/send">
            <RequireConnection eth><PaymentPage /></RequireConnection>
          </Route>
          <Route path="/contacts">
            <RequireConnection eth box><Contacts /></RequireConnection>
          </Route>
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Container>
    </Main>
  );
}

export default App;
