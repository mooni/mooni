import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Dialog } from '@material-ui/core';
import { Button, IconCaution, useTheme } from '@aragon/ui'

import { getModalError } from '../redux/ui/selectors';
import { setModalError } from '../redux/ui/actions';

export default function ErrorModal() {
  const modalError = useSelector(getModalError);
  const dispatch = useDispatch();
  const theme = useTheme();

  const error = modalError?.message;

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
            Unable to connect wallet
          </Box>
          <Box fontSize={12}>
            <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
              <IconCaution size="large" style={{color: theme.negative}}/>
            </Box>
            {error === 'eth_smart_account_not_supported' &&
            'We currently do not support smart account wallets such as Argent or Gnosis Safe.'
            }
            {error === 'eth_wrong_network_id' &&
            'Your wallet must be using Mainnet network, please switch.'
            }
            {error === 'no_ethereum_provider' &&
            'It seems you are not using an ethereum compatible browser. Please install Metamask or use a browser such as Brave.'
            }
            {error === 'unknown_error' &&
            'The wallet you are trying to connect with seems incompatible. Please report this problem to our support.'
            }
          </Box>
          <Box mb={1}/>
          <Button onClick={onCloseModal}>Close</Button>

        </Box>
      </Box>
    </Dialog>
  );
}
