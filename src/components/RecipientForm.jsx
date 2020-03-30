import React, { useState, useEffect } from 'react';
import useForm from 'react-hook-form';
import IBAN from 'iban';
import { makeStyles } from '@material-ui/core/styles';

import { COUNTRIES } from '../lib/countries';

import { Box } from '@material-ui/core';
import { Button, Field, IconArrowRight, DropDown, Link } from '@aragon/ui';

import { WideInput, FieldError } from './StyledComponents';

const useStyles = makeStyles(() => ({
  fieldRow: {
    marginBottom: '15px',
  },
}));

const fields = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  iban: {
    required: true,
    minLength: 14,
    maxLength: 34,
    validate: IBAN.isValid,
  },
  address: {
    minLength: 2,
    maxLength: 50,
  },
  zip: {
    minLength: 2,
    maxLength: 10,
  },
  city: {
    minLength: 2,
    maxLength: 10,
  },
  country: {
    minLength: 2,
    maxLength: 2,
    pattern: /^[A-Z]{2}$/,
  },
  bic_swift: {
    minLength: 8,
    maxLength: 11,
    pattern: /^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3}){0,1}$/,
  },
};

const countriesList = Object.keys(COUNTRIES);

const defaultEndComponent = ({ submit, hasErrors }) => (
  <Button mode="strong" onClick={submit} wide icon={<IconArrowRight/>} label="Save recipient" disabled={hasErrors} />
);

function RecipientForm({ initialRecipient, onSubmit, endComponent = defaultEndComponent }) {
  const classes = useStyles();
  const [more, setMore] = useState(false);

  const { register, handleSubmit, errors, setValue, reset } = useForm({
    mode: 'onChange',
    defaultValues: initialRecipient || undefined,
  });
  useEffect(() => {
    reset(initialRecipient);
  }, [initialRecipient]);

  const [selectedCountry, setSelectedCountry] = useState(
    initialRecipient?.owner?.country ?
      countriesList.indexOf(initialRecipient.owner.country)
      : undefined
  );
  const submit = handleSubmit(onSubmit);

  function setCountry(index) {
    setSelectedCountry(index);
    setValue('owner.country', countriesList[index]);
  }

  useEffect(() => {
    register({ name: 'owner.country' }, fields.country);
    setValue('owner.country', initialRecipient?.owner?.country || '');
  }, [register, initialRecipient, setValue]);

  const hasErrors = Object.keys(errors).length !== 0;

  return (
    <form onSubmit={submit}>
      <Field label="Name" className={classes.fieldRow}>
        <WideInput name="owner.name" ref={register(fields.name)} required data-private/>
        {errors['owner.name'] && <FieldError>Please enter your name</FieldError>}
      </Field>
      <Field label="IBAN" className={classes.fieldRow}>
        <WideInput name="iban" ref={register(fields.iban)} required data-private/>
        {errors.iban && <FieldError>Invalid IBAN</FieldError>}
      </Field>
      <Box className={classes.fieldRow}>
        <Link onClick={() => setMore(!more)}>
          {more ? 'Show less' : 'Show more'}
        </Link>
      </Box>
      {more &&
      <>
        <Field label="BIC/SWIFT" className={classes.fieldRow}>
          <WideInput name="bic_swift" ref={register(fields.bic_swift)} data-private/>
          {errors.bic_swift && <FieldError>Invalid BIC</FieldError>}
        </Field>
        <Field label="Address" className={classes.fieldRow}>
          <WideInput name="owner.address" ref={register(fields.address)} data-private/>
          {errors['owner.address'] && <FieldError>Invalid address</FieldError>}
        </Field>
        <Field label="Zip/Postal code" className={classes.fieldRow}>
          <WideInput name="owner.zip" ref={register(fields.zip)} data-private/>
          {errors['owner.zip'] && <FieldError>Invalid Zip/Code</FieldError>}
        </Field>
        <Field label="City" className={classes.fieldRow}>
          <WideInput name="owner.city" ref={register(fields.city)} data-private/>
          {errors['owner.city'] && <FieldError>Invalid city</FieldError>}
        </Field>
        <Field label="Country" className={classes.fieldRow}>
          <DropDown
            items={countriesList}
            selected={selectedCountry}
            onChange={setCountry}
            placeholder="Please select a country"
            wide
            data-private
          />
          {errors['owner.country'] && <FieldError>Invalid country</FieldError>}
        </Field>
      </>}
      {endComponent({ submit, hasErrors })}
    </form>
  )
}

export default RecipientForm;

