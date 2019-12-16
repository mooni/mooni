import React from 'react';

import { Box, Container } from '@material-ui/core'
import { Main, Header, Tag } from '@aragon/ui'

import {
  Switch,
  Route,
  Redirect,
  useHistory,
} from 'react-router-dom';

import './App.css'
import RequireConnection from './components/RequireConnection';
import Account from './components/Account';
import Login from './components/Login';
import MyAccountPage from './pages/MyAccountPage';
import PaymentPage from './pages/PaymentPage';
import Welcome from './pages/Welcome';

function App() {
  const history = useHistory();

  return (
    <Main assetsUrl={'/aragon-ui'}>
      <Login />
      <Header
        primary={
          <>
            <Box onClick={() => history.push('/')} style={{cursor: 'pointer'}}>
              Mooni
            </Box>
            <Box ml={1}>
              <Route path="/my-account">
                <Tag mode="identifier">My Account</Tag>
              </Route>
              <Route path="/send">
                <Tag mode="identifier">Send</Tag>
              </Route>
            </Box>
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
          <Route path="/send/:stepId">
            <RequireConnection eth><PaymentPage /></RequireConnection>
          </Route>
          <Route path="/send">
            <Redirect to="/send/0" />
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
