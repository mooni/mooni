import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, EthIdenticon, AddressField, IconWallet, IconPower, useViewport } from '@aragon/ui'
import { Box } from '@material-ui/core';

import { getAddress, getETHManagerLoading, getProviderFromIframe } from '../redux/eth/selectors';
import { openWeb3Modal, logout } from '../redux/eth/actions';

function Account() {
  const address = useSelector(getAddress);
  const ethManagerLoading = useSelector(getETHManagerLoading);
  const providerFromIframe = useSelector(getProviderFromIframe);
  const dispatch = useDispatch();
  const { below } = useViewport();

  function onLogin() {
    dispatch(openWeb3Modal());
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
      {!providerFromIframe && <Button icon={<IconPower />} size="medium" display="icon" label="logout" onClick={onLogout} />}
    </Box>
  );
}

export default Account;
