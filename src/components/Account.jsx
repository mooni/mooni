import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, EthIdenticon, AddressField, IconWallet, IconPower, useViewport } from '@aragon/ui'
import { Box } from '@material-ui/core';

import { getAddress, getETHManagerLoading } from '../redux/eth/selectors';
import { openLoginModal, logout } from '../redux/eth/actions';

function Account() {
  const address = useSelector(getAddress);
  const ethManagerLoading = useSelector(getETHManagerLoading);
  const dispatch = useDispatch();
  const { below } = useViewport();

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
      <Box mr={1} data-private>{addressComponent}</Box>
      <Button icon={<IconPower />} size="medium" display="icon" label="logout" onClick={onLogout} />
    </Box>
  );
}

export default Account;
