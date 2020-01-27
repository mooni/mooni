import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, EthIdenticon, AddressField, IconWallet, IconPower, useViewport } from '@aragon/ui'
import { Box } from '@material-ui/core';

import { getAddress, getETHManager, getETHManagerLoading } from '../redux/eth/selectors';
import { initETH, openLoginModal, logout } from '../redux/eth/actions';

// const AUTO_CONNECT = false; // TODO remember
const AUTO_CONNECT = true;

function Account() {
  const address = useSelector(getAddress);
  const ethManager = useSelector(getETHManager);
  const ethManagerLoading = useSelector(getETHManagerLoading);
  const dispatch = useDispatch();
  const { below } = useViewport();

  useEffect(() => {
    if(AUTO_CONNECT && !ethManager) {
      dispatch(initETH());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onLogin() {
    dispatch(openLoginModal());
  }
  function onLogout() {
    dispatch(logout());
  }

  if(ethManagerLoading)
    return (
      <Button disabled wide icon={<IconWallet/>} display="all" label="Connecting..." />
    );

  if(!address) {
    return (
      <Button onClick={onLogin} mode="strong" wide icon={<IconWallet/>} display="all" label="Login" />
    );
  }

  const addressComponent = below('medium') ?
    <EthIdenticon address={address} scale={1.6}/>
    :
    <Box width={230}><AddressField address={address} autofocus={false} /></Box>;

  return (
    <Box display="flex">
      <Box mr={1}>{addressComponent}</Box>
      <Button icon={<IconPower />} size="medium" display="icon" label="logout" onClick={onLogout} />
    </Box>
  );
}

export default Account;
