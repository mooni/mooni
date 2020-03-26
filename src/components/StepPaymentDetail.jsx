import React from 'react';
import useForm from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';
import EmailValidator from 'email-validator';

import { Box } from '@material-ui/core';

import { Button, Field, IconCheck } from '@aragon/ui'
import { WideInput, FieldError } from './StyledComponents';

import { setContactPerson, setReference } from '../redux/payment/actions';
import { getContactPerson, getReference } from '../redux/payment/selectors';

const fields = {
  email: {
    validate: EmailValidator.validate,
  },
  reference: {
    pattern: /^[0-9A-Za-z ]*$/,
  },
};

function StepPaymentDetail({ onComplete, onBack }) {
  const reference = useSelector(getReference);
  const contactPerson = useSelector(getContactPerson);
  const dispatch = useDispatch();

  const { register, handleSubmit, errors } = useForm({
    mode: 'onChange',
    defaultValues: {
      reference: reference || '',
      email: contactPerson?.email,
    },
  });

  const onSubmit = handleSubmit(data => {
    dispatch(setReference(data.reference));
    dispatch(setContactPerson({
      email: data.email,
    }));

    onComplete();
  });

  const hasErrors = Object.keys(errors).length !== 0;

  return (
    <Box width={1}>
      <form onSubmit={onSubmit}>
        <Box>
          <Field label="Your email (optional)">
            <WideInput
              name="email"
              ref={register(fields.email)}
              placeholder="elon@musk.io"
            />
            {errors.email && <FieldError>Invalid email</FieldError>}
          </Field>
          <Field label="Reference (optional)">
            <WideInput
              name="reference"
              ref={register(fields.reference)}
              placeholder="Bill A2313"
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
