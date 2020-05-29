import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import { Box } from '@material-ui/core';

import RateForm from '../components/RateForm';

import { setRateRequest } from '../redux/payment/actions';
import { getRateRequest } from '../redux/payment/selectors';

export default function StepAmount({ onComplete }) {
  const dispatch = useDispatch();
  const initialRateRequest = useSelector(getRateRequest);

  const onSubmit = (rateRequest) => {
    dispatch(setRateRequest(rateRequest));
    onComplete();
  };

  return (
    <Box width={1}>
      <RateForm onSubmit={onSubmit} initialRateRequest={initialRateRequest}/>
    </Box>
  )
}
