import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../UI/Loader';
import { Box } from '@material-ui/core';
import { EmptyStateCard, Button } from '@aragon/ui'

import { getWalletStatus, isWalletLoading } from '../../redux/wallet/selectors';
import { login } from '../../redux/wallet/actions';

import LoadImage from '../../assets/undraw_counting_stars_rrnl.svg';
import { WalletStatus } from "../../redux/wallet/state";

function RequireConnection({ children }) {
  const walletStatus = useSelector(getWalletStatus);
  const walletLoading = useSelector(isWalletLoading);
  const dispatch = useDispatch();

  if(walletStatus === WalletStatus.CONNECTED)
    return children();

  if(walletLoading)
    return <Loader text="Loading Ethereum wallet" />;

  return (
    <Box display="flex" justifyContent="center">
      <EmptyStateCard
        text="Please connect your Ethereum wallet"
        illustration={<img src={LoadImage} width="80%" alt="" />}
        action={<Button onClick={() => dispatch(login())}>Connect</Button>}
      />
    </Box>
  );
}

export default RequireConnection;
