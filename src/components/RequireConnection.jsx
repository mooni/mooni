import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../components/Loader';
import { Box } from '@material-ui/core';
import { EmptyStateCard, Button } from '@aragon/ui'

import { getETHManager, getETHManagerLoading } from '../redux/eth/selectors';
import { openLoginModal } from '../redux/eth/actions';

function RequireConnection({ children }) {
  const ethManager = useSelector(getETHManager);
  const ethManagerLoading = useSelector(getETHManagerLoading);
  const dispatch = useDispatch();

  function login() {
    dispatch(openLoginModal());
  }

  if(ethManager)
    return children;

  if(ethManagerLoading)
    return <Loader text="Loading Ethereum provider" />;

  if(!ethManager) {
    return (
      <Box display="flex" justifyContent="center">
        <EmptyStateCard
          text="Please connect your Ethereum wallet"
          action={<Button onClick={login}>Connect</Button>}
        />
      </Box>
    );
  }

  return children;
}

export default RequireConnection;
