import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../components/Loader';
import Box from '@material-ui/core/Box';
import { EmptyStateCard, Button } from '@aragon/ui'

import { getETHManager } from '../redux/eth/selectors';
import { getBoxManager, getBoxLoading } from '../redux/box/selectors';
import { initETH } from '../redux/eth/actions';
import { initBox } from '../redux/box/actions';

function RequireConnection({ children, eth, box }) {
  const boxManager = useSelector(getBoxManager);
  const ethManager = useSelector(getETHManager);
  const boxLoading = useSelector(getBoxLoading);
  const dispatch = useDispatch();
  const [connecting, setConnecting] = useState(false);

  async function connectETH() {
    setConnecting(true);
    await dispatch(initETH());
    setConnecting(false);
  }

  // Automatic connect ?
  useEffect(() => {
    if(eth && !ethManager) {
      connectETH().catch(console.error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function connectBox() {
    await dispatch(initBox());
  }

  if(eth && !ethManager) {
    if(connecting)
      return <Loader text="Loading eth provider" />;

    return (
      <Box display="flex" justifyContent="center">
        <EmptyStateCard
          text="Please connect your Ethereum wallet"
          action={<Button onClick={connectETH}>Connect</Button>}
        />
      </Box>
    );
  }

  if(box && !boxManager) {
    if(boxLoading)
      return <Loader text="Loading 3box" />;

    return (
      <Box display="flex" justifyContent="center">
        <EmptyStateCard
          text="Please connect to 3box to access your contacts"
          action={<Button onClick={connectBox}>Connect</Button>}
        />
      </Box>
    );
  }

  return children;
}

export default RequireConnection;
