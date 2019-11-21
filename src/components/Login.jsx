import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Connect from '../lib/connect';
import { Button } from '@aragon/ui'
import { isLogged } from '../redux/eth/selectors';
import { setAddress, setConnect } from '../redux/eth/actions';

function Login() {
  const logged = useSelector(isLogged);
  const dispatch = useDispatch();

  function login() {
    Connect.initWeb3().then(connect => {
      dispatch(setAddress(connect.accounts[0]));
      dispatch(setConnect(connect));
    }).catch(console.error);
  }
  function logout() {
    dispatch(setAddress(null));
    dispatch(setConnect(null));
  }

  if(logged) {
    return (
      <Button onClick={logout}>Logout</Button>
    );
  } else {
    return (
      <Button onClick={login} mode="strong">Login</Button>
    );
  }
}

export default Login;
