import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { Box, Typography } from '@material-ui/core';

import StepAmount from '../components/StepAmount';
import { setExchangeStep } from '../redux/payment/actions';
import { SmallWidth } from '../components/StyledComponents';

export default function HomePage() {
  const history = useHistory();
  const dispatch = useDispatch();

  const onGoToExchange = () => {
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
        <StepAmount onComplete={onGoToExchange} />
      </Box>
    </SmallWidth>
  );
}
