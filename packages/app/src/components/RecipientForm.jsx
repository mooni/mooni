import React, { useState, useEffect } from 'react';
import useForm from 'react-hook-form';
import IBAN from 'iban';
import EmailValidator from 'email-validator';

import { COUNTRIES } from '../lib/countries';

import { Box } from '@material-ui/core';
import { Button, IconArrowRight, DropDown, Link } from '@aragon/ui';

import FormField from './FormField';

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
  email: {
    validate: value => !value || value === '' || EmailValidator.validate(value),
  },
};

const countriesList = Object.keys(COUNTRIES);

const defaultEndComponent = ({ submit, hasErrors }) => (
  <Button mode="strong" onClick={submit} wide icon={<IconArrowRight/>} label="Save recipient" disabled={hasErrors} />
);

function RecipientForm({ initialRecipient, onSubmit, endComponent = defaultEndComponent }) {
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

      <FormField label="Full Name" name="owner.name" ref={register(fields.name)} errors={errors} errorMessage="Please enter your name" required />
      <FormField label="IBAN" name="iban" ref={register(fields.iban)} errors={errors} errorMessage="Invalid IBAN" required />

      <Box mb={2}>
        <Link onClick={() => setMore(!more)}>
          {more ? 'Show less' : 'Show more'}
        </Link>
      </Box>

      <Box display={more ? 'block' : 'none'}>
        <FormField label="BIC/SWIFT" name="bic_swift" ref={register(fields.bic_swift)} errors={errors} errorMessage="Invalid BIC" />
        <FormField label="Email" name="email" ref={register(fields.email)} errors={errors} errorMessage="Invalid email" />
        <FormField label="Address" name="owner.address" ref={register(fields.address)} errors={errors} errorMessage="Invalid address" />
        <FormField label="Zip/Postal code" name="owner.zip" ref={register(fields.zip)} errors={errors} errorMessage="Invalid Zip/Code" />
        <FormField label="City" name="owner.city" ref={register(fields.city)} errors={errors} errorMessage="Invalid city" />

        <FormField label="Country" name="owner.country" errors={errors} errorMessage="Invalid country">
          <DropDown
            items={countriesList}
            selected={selectedCountry}
            onChange={setCountry}
            placeholder="Please select a country"
            wide
            data-private
          />
        </FormField>
      </Box>

      {endComponent({ submit, hasErrors })}
    </form>
  )
}

export default RecipientForm;

