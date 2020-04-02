import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, } from '@material-ui/core';
import { Button, Modal, Link, IconCaution, useTheme } from '@aragon/ui'

import { getLoginModalOpen } from '../redux/eth/selectors';
import { initETH, openLoginModal } from '../redux/eth/actions';

import MetamaskIcon from '../assets/wallets/metamask-fox.svg';
import WalletConnectIcon from '../assets/wallets/walletConnectIcon.svg';
import PortisIcon from '../assets/wallets/portis_icon.svg';
import LedgerIcon from '../assets/wallets/ledger.png';

const walletProviders = [
  {
    name: 'Web3 Browser',
    type: 'injected',
    icon: <img src={MetamaskIcon} width="18" alt="metamask-wallet-icon"/>,
  },
  {
    name: 'WalletConnect',
    type: 'WalletConnect',
    icon: <img src={WalletConnectIcon} width="18" alt="walletconnect-icon"/>,
  },
  {
    name: 'Portis',
    type: 'Portis',
    icon: <img src={PortisIcon} width="16" alt="portis-icon"/>,
  },
  {
    name: 'Ledger',
    type: 'Ledger',
    icon: <img src={LedgerIcon} width="16" alt="ledger-icon"/>,
  },
];

function Login() {
  const [error, setError] = useState(null);
  const modalOpen = useSelector(getLoginModalOpen);
  const dispatch = useDispatch();
  const theme = useTheme();

  async function connectETH(walletType) {
    const error = await dispatch(initETH(walletType));
    if(!error) {
      dispatch(openLoginModal(false));
    } else {
      setError(error);
    }
  }

  function onCloseModal() {
    setError(null);
    dispatch(openLoginModal(false));
  }

  return (
    <Modal
      visible={modalOpen}
      onClose={onCloseModal}
      closeButton={true}
      width={300}
      padding={16}
    >
      { error ?
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
              <IconCaution size="large" style={{ color: theme.negative }}  />
            </Box>
            {
              error === 'eth_smart_account_not_supported' ?
                'We currently do not support smart account wallets such as Argent or Gnosis Safe.'
                :
                'The wallet you are trying to connect with seems incompatible. Please report this problem to our support.'
            }
            <br/>Sorry for the inconvenience.
          </Box>
        </Box>
      :
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
    </Modal>
  );
}

export default Login;
