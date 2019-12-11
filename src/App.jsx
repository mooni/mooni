import React from 'react';

import { Box, Container } from '@material-ui/core'
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

import { useSelector } from 'react-redux';
import { getDebug } from './redux/eth/selectors';

function App({ widget }) {
  const location = useLocation();
  const history = useHistory();
  const debug = useSelector(getDebug);

  const pageName = location.pathname && location.pathname !== '/' ? location.pathname.substring(1) : null;

  return (
    <Main>
      <Header
        primary={
          <>
            <Box onClick={() => history.push('/')} style={{cursor: 'pointer'}}>
              Mooni
            </Box>
            <Box ml={1}>
              {pageName && <Tag mode="identifier">{pageName}</Tag>}
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
        {debug &&
        {/*<Box>
          <Box>Debug:</Box>
          <Box>
            {JSON.stringify(debug, null, 2)}
          </Box>
        </Box>*/}
        }
      </Container>
    </Main>
  );
}

export default App;
