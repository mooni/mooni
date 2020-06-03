import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { Box, Typography } from '@material-ui/core';
import { Button, IconEthereum } from '@aragon/ui'

import { setExchangeStep, setRateRequest } from '../redux/payment/actions';
import { SmallWidth } from '../components/StyledComponents';
import { getETHManager } from '../redux/eth/selectors';
import { openWeb3Modal } from '../redux/eth/actions';
import RateForm from '../components/RateForm';
import { getRateRequest } from '../redux/payment/selectors';

export default function HomePage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const ethManager = useSelector(getETHManager);
  const initialRateRequest = useSelector(getRateRequest);

  function connectWallet() {
    dispatch(openWeb3Modal());
  }

  const onSubmit = (rateRequest) => {
    dispatch(setRateRequest(rateRequest));
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
        <RateForm onSubmit={onSubmit} initialRateRequest={initialRateRequest}/>
        {!ethManager &&
        <Button mode="positive" onClick={connectWallet} wide icon={<IconEthereum/>} label="Connect wallet" />
        }
      </Box>
    </SmallWidth>
  );
}
