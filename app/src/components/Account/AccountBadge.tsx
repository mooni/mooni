import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { EthIdenticon, IconWallet, useViewport, GU } from '@aragon/ui'
import { Box, Avatar, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

import {ShadowBox, RoundButton} from "../UI/StyledComponents";

import { getAddress, getWalletStatus, isWalletLoading } from '../../redux/wallet/selectors';
import { WalletStatus } from "../../redux/wallet/state";
import { selectENS } from '../../redux/user/userSlice';
import { login } from '../../redux/wallet/actions';

const HEIGHT = 5 * GU;
const IDENTICON_SIZE = 6 * GU;

// @ts-ignore
const BadgeBox = styled(ShadowBox)`
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: #eef1f6;
  }
`
// @ts-ignore
const ConnectedText = styled(Typography)`
  && {
  margin-left: 8px;
  color: #504E4E;
  }
`

function shortenedAddress(address) {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

function AccountBadge() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { below } = useViewport();

  const walletStatus = useSelector(getWalletStatus);
  const walletLoading = useSelector(isWalletLoading);
  const address = useSelector(getAddress);
  const ens = useSelector(selectENS);

  function goToProfile() {
    history.push('/account');
  }

  if(walletLoading)
    return (
      <RoundButton wide icon={<IconWallet/>} display="all" label="Connecting..." disabled />
    );

  function connectWallet() {
    dispatch(login());
  }

  if(walletStatus === WalletStatus.DISCONNECTED) {
    return (
      <RoundButton wide icon={<IconWallet/>} display="all" label="Not connected" onClick={connectWallet} />
    );
  }

  const displayedName = ens || shortenedAddress(address);

  return (
    <Box display="flex">
      <Box mr={1}>
        <BadgeBox onClick={goToProfile}>
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
            <ConnectedText variant="caption">
              {displayedName}
            </ConnectedText>
          }

          <MenuIcon color="disabled" style={{ marginLeft: 8, marginRight: 8 }} />
        </BadgeBox>
      </Box>
    </Box>
  );
}

export default AccountBadge;
