import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import { Box } from '@material-ui/core';
import { IconArrowRight } from '@aragon/ui'

import RateForm from './RateForm';

import { setTradeRequest } from '../../redux/payment/actions';
import { getMultiTradeRequest } from '../../redux/payment/selectors';

export default function StepAmount({ onComplete }) {
  const dispatch = useDispatch();
  const { tradeRequest } = useSelector(getMultiTradeRequest);

  const onSubmit = (tradeRequest) => {
    dispatch(setTradeRequest(tradeRequest));
    onComplete();
  };

  return (
    <Box width={1} py={1}>
      <RateForm onSubmit={onSubmit} initialTradeRequest={tradeRequest} />
    </Box>
  )
}
