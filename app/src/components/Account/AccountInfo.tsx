import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { Button } from '@aragon/ui'
import { Box, Typography } from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';

import {ShadowBox} from "../UI/StyledComponents";

import { getAddress, getProviderFromIframe } from '../../redux/wallet/selectors';
import { logout } from '../../redux/wallet/actions';
import { defaultProvider } from '../../lib/web3Providers';

// @ts-ignore
const BadgeBox = styled(ShadowBox)`
  padding: 12px;
  margin-bottom: 12px;
`

// @ts-ignore
const AddressText = styled(Typography)`
  && {
    color: #504E4E;
  }
`

function AccountBadge() {
  const dispatch = useDispatch();

  const address = useSelector(getAddress);
  const providerFromIframe = useSelector(getProviderFromIframe);

  const [ens, setENS] = useState<string>();

  useEffect(() => {
    if(address) {
      (async () => {
        const ens = await defaultProvider.lookupAddress(address);
        setENS(ens);
      })().catch(console.error);
    }
  }, [address]);

  function onLogout() {
    dispatch(logout());
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="subtitle1" align="center">Logged in as</Typography>
      <BadgeBox>
        <AddressText variant="caption" align="center">{address} {ens &&  `(${ens})`}</AddressText>
      </BadgeBox>
      {!providerFromIframe && <Button icon={<ExitToApp />} mode="negative" size="small" label="Disconnect" onClick={onLogout} />}
    </Box>
  );
}

export default AccountBadge;
