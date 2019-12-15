import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, } from '@material-ui/core';
import { Button, Modal, Link } from '@aragon/ui'

import { getLoginModalOpen } from '../redux/eth/selectors';
import { initETH, openLoginModal } from '../redux/eth/actions';

// const AUTO_CONNECT = false;
const walletProviders = [
  {
    name: 'Metamask',
    type: 'injected',
    icon: <img src="/images/wallets/metamask-fox.svg" width="18" alt="metamask-wallet-icon"/>,
  },
  {
    name: 'Coinbase Wallet',
    type: 'injected',
    icon: <img src="/images/wallets/coinbaseWalletIcon.svg" width="18" alt="coinbase-wallet-icon"/>,
  },
  {
    name: 'WalletConnect',
    type: 'WalletConnect',
    icon: <img src="/images/wallets/walletConnectIcon.svg" width="18" alt="walletconnect-icon"/>,
  },
  {
    name: 'Ledger',
    type: 'Ledger',
    icon: <img src="/images/wallets/ledger.png" width="16" alt="ledger-icon"/>,
  },
];

function Login() {
  const modalOpen = useSelector(getLoginModalOpen);
  const dispatch = useDispatch();

  async function connectETH(walletType) {
    dispatch(openLoginModal(false));
    await dispatch(initETH(walletType));
  }

  function onCloseModal() {
    dispatch(openLoginModal(false));
  }

  /*
  // Automatic connect ?
  useEffect(() => {
    if(AUTO_CONNECT && eth && !ethManager) {
      connectETH().catch(console.error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  */

  return (
    <Modal
      visible={modalOpen}
      onClose={onCloseModal}
      closeButton={true}
      width={300}
      padding={16}
    >
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
    </Modal>
  );
}

export default Login;
