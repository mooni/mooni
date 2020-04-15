import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Dialog } from '@material-ui/core';
import { Button, LoadingRing, Link, IconCaution, useTheme } from '@aragon/ui'

import {getETHManagerLoading, getLoginModalOpen} from '../redux/eth/selectors';
import { initETH, openLoginModal } from '../redux/eth/actions';

import MetamaskIcon from '../assets/wallets/metamask-fox.svg';
import WalletConnectIcon from '../assets/wallets/walletConnectIcon.svg';
import PortisIcon from '../assets/wallets/portis_icon.svg';
import LedgerIcon from '../assets/wallets/ledger.png';

const walletProviders = [
  {
    name: 'Metamask',
    type: 'injected',
    icon: <img src={MetamaskIcon} width="18" height="16" alt="metamask-wallet-icon"/>,
  },
  {
    name: 'WalletConnect',
    type: 'WalletConnect',
    icon: <img src={WalletConnectIcon} width="18" height="16" alt="walletconnect-icon"/>,
  },
  {
    name: 'Portis',
    type: 'Portis',
    icon: <img src={PortisIcon} width="18" height="22" alt="portis-icon"/>,
  },
  {
    name: 'Ledger',
    type: 'Ledger',
    icon: <img src={LedgerIcon} width="18" height="18" alt="ledger-icon"/>,
  },
];

function Login() {
  const [error, setError] = useState(null);
  const modalOpen = useSelector(getLoginModalOpen);
  const ethLoading = useSelector(getETHManagerLoading);
  const dispatch = useDispatch();
  const theme = useTheme();

  async function connectETH(walletType) {
    const error = await dispatch(initETH(walletType));
    setError(error);
    if(!error) {
      dispatch(openLoginModal(false));
    }
  }

  function onCloseModal() {
    setError(null);
    dispatch(openLoginModal(false));
  }

  return (
    <Dialog
      open={modalOpen}
      onClose={onCloseModal}
      maxWidth="sm"
    >
      <Box p={1}>
        {ethLoading &&
        <Box display="flex" alignItems="center">
          <LoadingRing mode="half-circle" />
        </Box>
        }

        {error &&
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
        </Box>
        }

        {!ethLoading && !error &&
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" width={1} p={2}>
          <Box
            fontSize={14}
            width={1}
            textAlign="center"
            my={2}
          >
            Connect to a wallet
          </Box>
          {walletProviders.map(walletProvider => (
            <Box
              key={walletProvider.name}
              width={1}
              my={1}
            >
              <Button
                onClick={() => connectETH(walletProvider.type)}
                wide
                display="all"
                icon={walletProvider.icon}
                label={walletProvider.name}
              />
            </Box>
          ))}
          <Box fontSize={12} mt={1}>
            New to ethereum ? &nbsp;
            <Link href="https://ethereum.org/use/#3-what-is-a-wallet-and-which-one-should-i-use" external>Learn more about wallets</Link>
          </Box>
        </Box>
        }
      </Box>
    </Dialog>
  );
}

export default Login;
