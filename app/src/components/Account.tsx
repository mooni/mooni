import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { Button, EthIdenticon, IconWallet, IconPower, useViewport, GU } from '@aragon/ui'
import { Box, Avatar, Typography } from '@material-ui/core';

import {ShadowBox} from "./StyledComponents";

import { getAddress, getWalletStatus, getProviderFromIframe, isWalletLoading } from '../redux/wallet/selectors';
import { logout } from '../redux/wallet/actions';
import { defaultProvider } from '../lib/web3Providers';
import { WalletStatus } from "../redux/wallet/state";

const HEIGHT = 5 * GU;
const IDENTICON_SIZE = 6 * GU;

// @ts-ignore
const ProfileBox = styled(ShadowBox)`
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: #fafafb;
  }
`
// @ts-ignore
const ProfileName = styled.span`
  margin-left: 10px;
  margin-right: 10px;
  color: #504E4E;
`

function shortenedAddress(address) {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

function Account() {
  const dispatch = useDispatch();
  const { below } = useViewport();

  const walletStatus = useSelector(getWalletStatus);
  const walletLoading = useSelector(isWalletLoading);
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

  if(walletLoading)
    return (
      <Button disabled wide icon={<IconWallet/>} display="all" label="Connecting..." />
    );

  if(walletStatus === WalletStatus.DISCONNECTED) {
    return (
      <Button disabled wide icon={<IconWallet/>} display="all" label="Not connected" />
    );
  }

  const displayedName = ens || shortenedAddress(address);

  return (
    <Box display="flex">
      <Box mr={1} data-private>
        <ProfileBox>
          <Avatar>
            <EthIdenticon
              address={address}
              scale={1.6}
              css={`
                transform: scale(${(HEIGHT - 2) / IDENTICON_SIZE});
                transform-origin: 50% 50%;
              `}
            />
          </Avatar>
          {
            !below('medium') &&
            <ProfileName>
              <Typography variant="caption">
                {displayedName}
              </Typography>
            </ProfileName>
          }
        </ProfileBox>
      </Box>
      {!providerFromIframe && <Button icon={<IconPower />} size="medium" display="icon" label="logout" onClick={onLogout} />}
    </Box>
  );
}

export default Account;
