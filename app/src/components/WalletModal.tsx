import React from 'react';
import { useSelector } from 'react-redux';

import { Box, Dialog } from '@material-ui/core';
import { textStyle, LoadingRing } from '@aragon/ui'
import { Button } from '@material-ui/core';

import { logout } from '../redux/wallet/actions';
import { getWalletStatus } from '../redux/wallet/selectors';
import { useAppDispatch } from '../redux/store';
import styled from 'styled-components';
import { WalletStatus } from "../redux/wallet/state";

const Title = styled.p`
  ${textStyle('title4')};
`;
const Content = styled.p`
  ${textStyle('body3')};
`;

export default function WalletModal() {
  const walletStatus = useSelector(getWalletStatus);
  const dispatch = useAppDispatch();

  const dialogOpen = walletStatus !== WalletStatus.CONNECTED && walletStatus !== WalletStatus.DISCONNECTED;
  const allowCancel = walletStatus !== WalletStatus.DISCONNECTING;

  return (
    <Dialog
      open={dialogOpen}
      maxWidth="sm"
    >
      <Box p={1}>
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" width={1} p={2}>
          <Box
            width={1}
            mb={1}
            textAlign="center"
          >
            <Title>
              {walletStatus === WalletStatus.LOADING && 'Loading Wallet...'}
              {walletStatus === WalletStatus.WAITING_APPROVAL && 'Waiting wallet...'}
              {walletStatus === WalletStatus.WAITING_SIGNATURE && 'Waiting for signature...'}
              {walletStatus === WalletStatus.DISCONNECTING && 'Disconnecting wallet...'}
            </Title>
          </Box>
          <Box my={1}>
            <LoadingRing mode="half-circle" />
          </Box>
          <Box
            width={1}
            textAlign="center"
            my={1}
          >
            <Content>
              {walletStatus === WalletStatus.LOADING && 'That\'ll be quick!'}
              {walletStatus === WalletStatus.WAITING_APPROVAL && 'Please approve Mooni in your wallet'}
              {walletStatus === WalletStatus.WAITING_SIGNATURE && <span>
                We need to verify you are the owner of this address.<br/>
                Please accept the signature request in your wallet to be able to access the app.
              </span>}
            </Content>
          </Box>
          {allowCancel &&
          <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => dispatch(logout())}
          >
              Cancel
          </Button>
          }
        </Box>
      </Box>
    </Dialog>
  );
}
