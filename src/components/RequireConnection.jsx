import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, CircularProgress } from '@material-ui/core';

import { getConnect } from '../redux/eth/selectors';
import { getBoxManager } from '../redux/box/selectors';
import { initConnect } from '../redux/eth/actions';
import { initBox } from '../redux/box/actions';

function RequireConnection({ children, eth, box }) {
  const boxManager = useSelector(getBoxManager);
  const connect = useSelector(getConnect);
  const dispatch = useDispatch();

  useEffect(() => {
    if (eth && !connect) {
      dispatch(initConnect());
    }
  }, [eth, connect]);

  useEffect(() => {
    if (eth && box && connect && !boxManager) {
      dispatch(initBox());
    }
  }, [eth, box, connect, boxManager]);

  if(eth && !connect) {
    return (
      <Box mx="auto">
        Loading eth provider
        <CircularProgress />
      </Box>
    );
  }
  if(box && !boxManager) {
    return (
      <Box mx="auto">
        Loading 3box
        <CircularProgress />
      </Box>
    );
  }
  return children;
}

export default RequireConnection;
