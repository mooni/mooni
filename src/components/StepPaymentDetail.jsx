import React from 'react';
import useForm from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';

import { Box } from '@material-ui/core';

import { Button, Field, IconCheck } from '@aragon/ui'
import { WideInput, FieldError } from './StyledComponents';

import { setReference } from '../redux/payment/actions';
import { getReference } from '../redux/payment/selectors';

const fields = {
  reference: {
    pattern: /^[0-9A-Za-z ]*$/,
  },
};

function StepPaymentDetail({ onComplete }) {
  const reference = useSelector(getReference);
  const dispatch = useDispatch();

  const { register, handleSubmit, errors } = useForm({
    mode: 'onChange',
    defaultValues: {
      reference: reference || '',
    },
  });

  const onSubmit = handleSubmit(data => {
    dispatch(setReference(data.reference));
    onComplete();
  });

  const hasErrors = Object.keys(errors).length !== 0;

  return (
    <Box width={1}>
      <form onSubmit={onSubmit}>
        <Box>
          <Field label="Reference (optional)">
            <WideInput
              name="reference"
              ref={register(fields.reference)}
              placeholder="Bill A2313"
              data-private
            />
            {errors.reference && <FieldError>Invalid reference, please only use regular letters and numbers</FieldError>}
          </Field>
        </Box>
        <Button mode="strong" onClick={onSubmit} wide icon={<IconCheck/>} label="Create order" disabled={hasErrors} />
      </form>
    </Box>
  )
}

export default StepPaymentDetail;
