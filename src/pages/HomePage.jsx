import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { Box, Typography } from '@material-ui/core';
import { Info } from '@aragon/ui'

import StepAmount from '../components/StepAmount';
import { setPaymentStep } from '../redux/payment/actions';

export default function HomePage() {
  const history = useHistory();
  const dispatch = useDispatch();

  const onGoToExchange = () => {
    dispatch(setPaymentStep(1));
    history.push('/exchange');
  };

  return (
    <Box width={1} py={2}>
      <Box textAlign="center">
        <Typography variant="subtitle1">
          Transfer funds from your crypto wallet to your bank account.
        </Typography>
      </Box>
      <StepAmount onComplete={onGoToExchange} />
      <Box pt={2}>
        <Info mode="error">
          Mooni is unaudited, please proceed with caution.
        </Info>
      </Box>
    </Box>
  );
}
