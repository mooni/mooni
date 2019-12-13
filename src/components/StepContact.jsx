import React from 'react';
import useForm from 'react-hook-form';
import {useDispatch} from 'react-redux';

import { Box, Grid } from '@material-ui/core';

import { Button, Field, IconArrowLeft, IconArrowRight } from '@aragon/ui'
import { WideInput, FieldError } from './StyledComponents';

import { setContactPerson } from '../redux/payment/actions';

function StepPaymentDetail({ onComplete, onBack }) {
  const dispatch = useDispatch();

  const { register, handleSubmit, errors } = useForm({
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(async data => {
    if(data.email) {
      dispatch(setContactPerson({
        email: data.email,
      }));
    }

    onComplete();
  });

  const fields = {
    email: {
      pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    },
  };

  return (
    <Box width={1}>
      <form onSubmit={onSubmit}>
        <Box py={2}>
          <Box mb={1}>
            Please provide an email address to get notified about the status of your transaction.
          </Box>
          <Field label="Email (optional)">
            <WideInput
              name="email"
              ref={register(fields.email)}
              placeholder="elon@musk.io"
            />
            {errors.email && <FieldError>Invalid email</FieldError>}
          </Field>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button mode="normal" onClick={onBack} wide icon={<IconArrowLeft/>} label="Go back" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button mode="strong" onClick={onSubmit} wide icon={<IconArrowRight/>} label="Save contact" />
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default StepPaymentDetail;
