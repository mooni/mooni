import React, { useState } from 'react';
import {useDispatch, useSelector} from 'react-redux';

import { Box } from '@material-ui/core';

import { Button, IconArrowRight } from '@aragon/ui'
import RateForm from '../components/RateForm';

import { setRateRequest } from '../redux/payment/actions';
import { getRateRequest } from '../redux/payment/selectors';

export default function StepAmount({ onComplete }) {
  const dispatch = useDispatch();
  const defaultRateRequest = useSelector(getRateRequest);
  const [localRateRequest, setLocalRateRequest] = useState(null);
  const [rateValid, setRateValid] = useState(false);

  const onSubmit = () => {
    dispatch(setRateRequest(localRateRequest));
    onComplete();
  };

  return (
    <Box width={1}>
      <RateForm onChange={setLocalRateRequest} onValid={setRateValid} defaultRateRequest={defaultRateRequest}/>
      <Button mode="strong" onClick={onSubmit} wide icon={<IconArrowRight />} label="Next" disabled={!rateValid} />
    </Box>
  )
}
