import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { Box, Typography } from '@material-ui/core';
import { Button, IconEthereum, IconWallet } from '@aragon/ui'

import { setExchangeStep, setTradeRequest } from '../redux/payment/actions';
import { SmallWidth } from '../components/StyledComponents';
import {getWalletStatus, isWalletLoading} from '../redux/wallet/selectors';
import { login } from '../redux/wallet/actions';
import RateForm from '../components/RateForm';
import { getMultiTradeRequest } from '../redux/payment/selectors';
import {WalletStatus} from "../redux/wallet/state";

export default function HomePage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const walletStatus = useSelector(getWalletStatus);
  const walletLoading = useSelector(isWalletLoading);
  const { tradeRequest } = useSelector(getMultiTradeRequest);

  function connectWallet() {
    dispatch(login());
  }

  const onSubmit = (tradeRequest) => {
    dispatch(setTradeRequest(tradeRequest));
    dispatch(setExchangeStep(1));
    history.push('/exchange');
  };

  return (
    <SmallWidth>
      <Box width={1} py={2}>
        <Box textAlign="center">
          <Typography variant="subtitle1">
            Transfer funds from your crypto wallet to your bank account.
          </Typography>
        </Box>
        <RateForm onSubmit={onSubmit} initialTradeRequest={tradeRequest}/>
        {walletStatus === WalletStatus.DISCONNECTED &&
        <Button mode="positive" onClick={connectWallet} wide icon={<IconEthereum/>} label="Connect wallet" />
        }
        {walletLoading &&
        <Button disabled wide icon={<IconWallet/>} display="all" label="Connecting..." />
        }
      </Box>
    </SmallWidth>
  );
}
