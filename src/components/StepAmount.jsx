import React, { useState , useEffect} from 'react';
import useForm from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';

import { Box, Grid } from '@material-ui/core';

import { Button, Field, IconArrowLeft, IconArrowRight } from '@aragon/ui'
import { WideInput, FieldError } from './StyledComponents';
import RateForm from '../components/RateForm';

import {setAmountDetail, setContactPerson, setReference} from '../redux/payment/actions';
import {getAmountDetail, getContactPerson, getReference} from '../redux/payment/selectors';

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
