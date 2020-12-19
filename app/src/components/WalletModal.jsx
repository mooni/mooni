import React from 'react';
import { useSelector } from 'react-redux';

import { Box, Dialog } from '@material-ui/core';
import { textStyle, LoadingRing } from '@aragon/ui'
import { Button } from '@material-ui/core';

import { logout } from '../redux/eth/actions';
import { getETHManagerLoading } from '../redux/eth/selectors';
import { useAppDispatch } from '../redux/store';
import styled from 'styled-components';

const Title = styled.p`
  ${textStyle('title4')};
`;
const Content = styled.p`
  ${textStyle('body3')};
`;

export default function WalletModal() {
  const ethManagerLoading = useSelector(getETHManagerLoading);
  const dispatch = useAppDispatch();

  return (
    <Dialog
      open={ethManagerLoading}
      maxWidth="sm"
    >
      <Box p={1}>
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" width={1} p={2}>
          <Box
            width={1}
            textAlign="center"
          >
            <Title>Connecting Wallet...</Title>
          </Box>
          <Box mt={2}>
            <LoadingRing mode="half-circle" />
          </Box>
          <Box
            width={1}
            textAlign="center"
            my={2}
          >
            <Content>
              Please authorize Mooni in your wallet. <br/>
              Don't forget to sign the message to be able to access the app.
            </Content>
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => dispatch(logout())}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
