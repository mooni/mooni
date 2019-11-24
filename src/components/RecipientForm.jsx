import React from 'react';
import useForm from 'react-hook-form';
import IBAN from 'iban';

import { Button, Field, IconArrowRight, useTheme } from '@aragon/ui'
import { WideInput } from './StyledComponents';

function FieldError({ text, children }) {
  const theme = useTheme();
  return (
    <p style={{color: theme.negative}}>
      {text || children}
    </p>
  )
}
function RecipientForm({ initialRecipient, onSubmit }) {
  const { register, handleSubmit, errors } = useForm();

  const submit = handleSubmit(onSubmit);

  const fields = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    address: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    zip: {
      required: true,
      minLength: 2,
      maxLength: 10,
    },
    city: {
      required: true,
      minLength: 2,
      maxLength: 10,
    },
    country: {
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^[A-Z]{2}$/,
    },
    iban: {
      required: true,
      minLength: 27,
      maxLength: 27,
      validate: IBAN.isValid,
    },
    bic_swift: {
      required: true,
      pattern: /^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3}){0,1}/,
    },
  };

  return (
    <form onSubmit={submit}>
      <Field label="IBAN">
        <WideInput name="iban" ref={register(fields.iban)} defaultValue={initialRecipient.iban} required/>
        {errors.iban && <FieldError>Invalid IBAN</FieldError>}
      </Field>
      <Field label="BIC/SWIFT">
        <WideInput name="bic_swift" ref={register(fields.bic_swift)} defaultValue={initialRecipient.bic_swift} required/>
        {errors.bic_swift && <FieldError>Invalid BIC</FieldError>}
      </Field>
      <Field label="Name">
        <WideInput name="owner.name" ref={register(fields.name)} defaultValue={initialRecipient.owner.name} required/>
        {errors['owner.name'] && <FieldError>Please enter your name</FieldError>}
      </Field>
      <Field label="Address">
        <WideInput name="owner.address" ref={register(fields.address)} defaultValue={initialRecipient.owner.address} required/>
        {errors['owner.address'] && <FieldError>Invalid address</FieldError>}
      </Field>
      <Field label="Zip/Postal code">
        <WideInput name="owner.zip" ref={register(fields.zip)}  defaultValue={initialRecipient.owner.zip} required/>
        {errors['owner.zip'] && <FieldError>Invalid Zip/Code</FieldError>}
      </Field>
      <Field label="City">
        <WideInput name="owner.city" ref={register(fields.city)}  defaultValue={initialRecipient.owner.city} required/>
        {errors['owner.city'] && <FieldError>Invalid city</FieldError>}
      </Field>
      <Field label="Country">
        <WideInput name="owner.country" ref={register(fields.country)}  defaultValue={initialRecipient.owner.country} required/>
        {errors['owner.country'] && <FieldError>Invalid country</FieldError>}
      </Field>
      <Button mode="strong" onClick={submit} wide icon={<IconArrowRight/>} label="Save recipient" />
    </form>
  )
}

export default RecipientForm;
