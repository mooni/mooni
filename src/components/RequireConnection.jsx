import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../components/Loader';
import Box from '@material-ui/core/Box';
import { EmptyStateCard, Button } from '@aragon/ui'

import { getETHManager, getETHManagerLoading } from '../redux/eth/selectors';
import { getBoxManager, getBoxLoading } from '../redux/box/selectors';
import { initETH } from '../redux/eth/actions';
import { initBox } from '../redux/box/actions';

function RequireConnection({ children, eth, box }) {
  const boxManager = useSelector(getBoxManager);
  const ethManager = useSelector(getETHManager);
  const boxLoading = useSelector(getBoxLoading);
  const ethManagerLoading = useSelector(getETHManagerLoading);
  const dispatch = useDispatch();

  async function connectETH() {
    await dispatch(initETH());
  }

  async function connectBox() {
    await dispatch(initBox());
  }

  /*
  // Automatic connect ?
  useEffect(() => {
    if(eth && !ethManager) {
      connectETH().catch(console.error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  */


  if(ethManagerLoading)
    return <Loader text="Loading eth provider" />;

  if(boxLoading)
    return <Loader text="Loading 3box" />;

  if(eth && !ethManager) {
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
