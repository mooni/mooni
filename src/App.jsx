import React from 'react';
import { useSelector } from 'react-redux';

import { Container } from '@material-ui/core'
import { Main, AppBar } from '@aragon/ui'

import {
  Switch,
  Route,
  Redirect,
  useLocation,
  useHistory
} from 'react-router-dom';

import './App.css'
import Account from './components/Account';
import MyAccountPage from './pages/MyAccountPage';
import PaymentPage from './pages/PaymentPage';
import Welcome from './pages/Welcome';
import Contacts from './pages/ContactsPage';
import { isLogged } from './redux/eth/selectors';

function App() {
  const location = useLocation();
  const history = useHistory();
  const logged = useSelector(isLogged);

  const pageName = location.pathname && location.pathname !== '/' ? location.pathname.substring(1) : null;

  return (
    <Main>
      <AppBar
        title="Crypto Off-Ramp"
        onTitleClick={() => history.push('/')}
        endContent={<Account />}
      >
        {pageName}
      </AppBar>
      <Container maxWidth="md">
          {
            logged ?
              <Switch>
                <Route exact path="/">
                  <Welcome />
                </Route>
                <Route path="/my-account">
                  <MyAccountPage />
                </Route>
                <Route path="/send">
                  <PaymentPage />
                </Route>
                <Route path="/contacts">
                  <Contacts />
                </Route>
                <Route path="*">
                  <Redirect to="/" />
                </Route>
              </Switch>
              :
              <Switch>
                <Route exact path="/">
                  <Welcome />
                </Route>
                <Route path="*">
                  <Redirect to="/" />
                </Route>
              </Switch>
          }
      </Container>
    </Main>
  );
}

export default App;
