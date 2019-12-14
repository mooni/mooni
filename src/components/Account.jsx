import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, EthIdenticon, AddressField, IconWallet, IconPower, useViewport } from '@aragon/ui'
import { Box } from '@material-ui/core';

import { getAddress } from '../redux/eth/selectors';
import { openLoginModal, logout } from '../redux/eth/actions';


function Account() {
  const address = useSelector(getAddress);
  const dispatch = useDispatch();
  const { below } = useViewport();

  function onLogin() {
    dispatch(openLoginModal());
  }
  function onLogout() {
    dispatch(logout());
  }

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
      <Button icon={<IconPower />} size="medium" onClick={onLogout} />
    </Box>
  );
}

export default Account;
