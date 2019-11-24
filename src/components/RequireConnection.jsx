import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../components/Loader';

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
  }, [eth, connect, dispatch]);

  useEffect(() => {
    if (eth && box && connect && !boxManager) {
      dispatch(initBox());
    }
  }, [eth, box, connect, boxManager, dispatch]);

  if(eth && !connect) {
    return <Loader text="Loading eth provider" />;
  }
  if(box && !boxManager) {
    return <Loader text="Loading 3box" />;
  }
  return children;
}

export default RequireConnection;
