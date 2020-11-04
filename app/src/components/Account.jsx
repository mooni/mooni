import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, EthIdenticon, AddressField, IconWallet, IconPower, IconClose, useViewport, GU } from '@aragon/ui'
import { Box } from '@material-ui/core';

import { getAddress, getETHManager, getETHManagerLoading, getProviderFromIframe } from '../redux/eth/selectors';
import { logout } from '../redux/eth/actions';

const HEIGHT = 5 * GU;
const IDENTICON_SIZE = 6 * GU;

function Account() {
  const address = useSelector(getAddress);
  const [ens, setENS] = useState();
  const ethManager = useSelector(getETHManager);
  const ethManagerLoading = useSelector(getETHManagerLoading);
  const providerFromIframe = useSelector(getProviderFromIframe);
  const dispatch = useDispatch();
  const { below } = useViewport();

  useEffect(() => {
    if(address) {
      (async () => {
        const ens = await ethManager.provider.lookupAddress(address);
        setENS(ens);
      })().catch(console.error);
    }
  }, [address]);

  function onLogout() {
    dispatch(logout());
  }

  if(ethManagerLoading)
    return (
      <>
        <Button disabled wide icon={<IconWallet/>} display="all" label="Connecting..." />
        <Box width={10}/>
        <Button icon={<IconClose/>} size="medium" display="icon" label="logout" mode="negative" onClick={onLogout} />
      </>
    );

  if(!address) {
    return (
      <Button disabled wide icon={<IconWallet/>} display="all" label="Not connected" />
    );
  }

  const addressComponent = below('medium') ?
    <EthIdenticon address={address} scale={1.6}/>
    :
    <Box width={230}>
      <AddressField
        address={ens || address}
        autofocus={false}
        icon={
          <EthIdenticon
            address={address}
            scale={1.6}
            css={`
                transform: scale(${(HEIGHT - 2) / IDENTICON_SIZE});
                transform-origin: 50% 50%;
              `}
          />
        }
      />
    </Box>;

  return (
    <Box display="flex">
      <Box mr={1} data-private>{addressComponent}</Box>
      {!providerFromIframe && <Button icon={<IconPower />} size="medium" display="icon" label="logout" onClick={onLogout} />}
    </Box>
  );
}

export default Account;
