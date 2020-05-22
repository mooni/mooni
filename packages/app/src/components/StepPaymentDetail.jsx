import React from 'react';
import useForm from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import { Box } from '@material-ui/core';

import { Button, GU, IconArrowRight, textStyle } from '@aragon/ui'

import { setReference } from '../redux/payment/actions';
import { getReference } from '../redux/payment/selectors';
import FormField from './FormField';

const fields = {
  reference: {
    pattern: /^[0-9A-Za-z ]*$/,
  },
};

const Hint = styled.p`
  ${textStyle('body3')};
  margin-bottom: ${1 * GU}px;
  text-align: center;
  color: #5d6d7b;
`;

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
        <Hint>
          Please provide details for the wire transfer
        </Hint>
        <FormField
          label="Reference (optional)"
          name="reference"
          ref={register(fields.reference)}
          errors={errors}
          errorMessage="Invalid reference, please only use regular letters and numbers"
          placeholder="Bill A2313"
        />
        <Button mode="strong" onClick={onSubmit} wide icon={<IconArrowRight/>} label="Next" disabled={hasErrors} />
      </form>
    </Box>
  )
}

export default StepPaymentDetail;
