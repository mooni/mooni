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
import RequireConnection from './components/RequireConnection';
import Account from './components/Account';
import Footer from './components/Footer';
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
        <Footer />
      </Container>
    </Main>
  );
}

export default App;
