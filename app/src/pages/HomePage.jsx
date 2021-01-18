import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { Box, Typography } from '@material-ui/core';

import { setExchangeStep, setTradeRequest } from '../redux/payment/actions';
import { SmallWidth } from '../components/UI/StyledComponents';
import RateForm from '../components/Payment/RateForm';
import { getMultiTradeRequest } from '../redux/payment/selectors';

export default function HomePage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { tradeRequest } = useSelector(getMultiTradeRequest);

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
      </Box>
    </SmallWidth>
  );
}
