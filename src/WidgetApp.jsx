import React, { useState } from 'react';

import { Container, Modal } from '@material-ui/core'
import { Main, Button, Root } from '@aragon/ui'

import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import './App.css'
import RequireConnection from './components/RequireConnection';
import PaymentPage from './pages/PaymentPage';
import {makeStyles} from '@material-ui/core/styles/index';

const useStyles = makeStyles(() => ({
  container: {
    backgroundColor: 'white',
    border: '1px solid black',
    margin: '50px auto',
    width: '85%',
    height: '700px',
    overflow: 'scroll',
    padding: '20px',
  },
}));

function App() {
  const [show, setShow] = useState(false);
  const classes = useStyles();

  if(!show) {
    return (
      <Button onClick={() => setShow(true)}>Cash out</Button>
    );
  }
  return (
    <>
      <Button onClick={() => setShow(true)}>Cash out</Button>

      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={true}
        onClose={() => setShow(false)}
      >
        <div className={classes.container}>
          <Main assetsUrl={'/aragon-ui'}>
            <Switch>
              <Route path="/send/:stepId">
                <RequireConnection eth><PaymentPage /></RequireConnection>
              </Route>
              <Route path="*">
                <Redirect to="/send/0" />
              </Route>
            </Switch>
          </Main>
        </div>
      </Modal>
    </>
  );
}

export default App;
