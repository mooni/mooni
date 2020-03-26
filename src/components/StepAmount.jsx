import React, { useState } from 'react';
import {useDispatch, useSelector} from 'react-redux';

import { Box } from '@material-ui/core';

import { Button, IconArrowRight } from '@aragon/ui'
import RateForm from '../components/RateForm';

import {setAmountDetail} from '../redux/payment/actions';
import {getAmountDetail} from '../redux/payment/selectors';

function StepPaymentDetail({ onComplete }) {
  const dispatch = useDispatch();
  const amountDetails = useSelector(getAmountDetail);
  const [rateRequest, setRateRequest] = useState(null);

  const onSubmit = data => {
    if(rateRequest) {
      dispatch(setAmountDetail(rateRequest));
    }

    onComplete();
  };

  return (
    <Box width={1}>
      <RateForm onChange={setRateRequest} defaultRateRequest={amountDetails}/>
      <Button mode="strong" onClick={onSubmit} wide icon={<IconArrowRight/>} label="Save amount" />
    </Box>
  )
}

export default StepPaymentDetail;
