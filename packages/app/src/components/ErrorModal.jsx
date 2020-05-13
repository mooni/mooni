import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Dialog } from '@material-ui/core';
import { Button, IconCaution, useTheme } from '@aragon/ui'

import { getModalError } from '../redux/ui/selectors';
import { setModalError } from '../redux/ui/actions';

const networkName = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  42: 'Kovan',
};

function getErrorTitle(error) {
  switch(error?.message) {
    case 'eth_smart_account_not_supported':
    case 'eth_wrong_network_id':
    case 'no_ethereum_provider':
      return 'Unable to connect wallet.';
    case 'invalid-custom-token':
      return 'Invalid token';
    default:
      return 'Unknown error';
  }
}

function getErrorContent(error) {
  switch(error?.message) {
    case 'eth_smart_account_not_supported':
      return 'We currently do not support smart account wallets such as Argent or Gnosis Safe.';
    case 'eth_wrong_network_id':
      return `Your wallet is on a wrong network. Please switch to ${networkName[error.networkId]}.`;
    case 'no_ethereum_provider':
      return 'It seems you are not using an ethereum compatible browser. Please install Metamask or use a browser such as Brave.';
    case 'unknown_error':
      return 'The wallet you are trying to connect with seems incompatible. Please report this problem to our support.';
    case 'invalid-custom-token':
      return 'The token address you provided is either invalid or does not exist on Uniswap.';
    default:
      return 'We did not expect that error, and will try to fix it soon. Do not hesitate to contact the support to help get this fixed.';
  }
}

export default function ErrorModal() {
  const modalError = useSelector(getModalError);
  const dispatch = useDispatch();
  const theme = useTheme();

  function onCloseModal() {
    dispatch(setModalError(null));
  }

  return (
    <Dialog
      open={!!modalError}
      onClose={onCloseModal}
      maxWidth="sm"
    >
      <Box p={1}>
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" width={1} p={2}>
          <Box
            fontSize={14}
            width={1}
            textAlign="center"
            mb={1}
          >
            {getErrorTitle(modalError)}
          </Box>
          <Box fontSize={12}>
            <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
              <IconCaution size="large" style={{color: theme.negative}}/>
            </Box>
            {getErrorContent(modalError)}
          </Box>
          <Box mb={1}/>
          <Button onClick={onCloseModal}>Close</Button>

        </Box>
      </Box>
    </Dialog>
  );
}
