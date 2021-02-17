import React, { useState, useEffect } from 'react';
import useForm from 'react-hook-form';
import IBAN from 'iban';
import EmailValidator from 'email-validator';
import styled from "styled-components";

import { Button, IconArrowRight } from '@aragon/ui';

import FormField from './FormField';
import CountrySelect from "../UI/CountrySelect";

const fields = {
  iban: {
    required: true,
    minLength: 14,
    maxLength: 34,
    validate: IBAN.isValid,
  },
  reference: {
    pattern: /^[0-9A-Za-z .,:+-]*$/,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  address: {
    minLength: 2,
    maxLength: 50,
    required: true,
  },
  zip: {
    required: true,
    minLength: 2,
    maxLength: 10,
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 30,
  },
  country: {
    required: true,
    minLength: 2,
    maxLength: 2,
  },
  bic_swift: {
    minLength: 8,
    maxLength: 11,
    pattern: /^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3}){0,1}$/,
  },
  email: {
    validate: value => !value || value === '' || EmailValidator.validate(value),
  },
};

const errorMessages = {
  'reference': 'Invalid reference, please only use regular letters and numbers',
  'recipient.iban': 'Invalid IBAN',
  'recipient.bic_swift': 'Invalid BIC',
  'recipient.email': 'Invalid email',
  'recipient.owner.name': 'Invalid name',
  'recipient.owner.address': 'Invalid address',
  'recipient.owner.zip': 'Invalid Zip/Code',
  'recipient.owner.city': 'Invalid city',
  'recipient.owner.country': 'Invalid country',
};

const Section = styled.p`
  text-align: center;
  color: ${props => props.theme.contentSecondary};
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.8rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
`;

const defaultEndComponent = ({ submit, hasErrors }) => (
  <Button mode="strong" onClick={submit} wide icon={<IconArrowRight/>} label="Save recipient" disabled={hasErrors} />
);

function RecipientForm({ initialData, onSubmit, endComponent = defaultEndComponent }) {
  // const [more, setMore] = useState(false);

  const { register, handleSubmit, errors, setValue, reset } = useForm({
    mode: 'onChange',
    defaultValues: initialData || undefined,
  });
  useEffect(() => {
    reset(initialData);
  }, [reset, initialData]);
  const submit = handleSubmit(onSubmit);

  const [selectedCountryCode, setSelectedCountryCode] = useState(
    initialData?.recipient?.owner?.country
  );
  function setCountry(countryCode) {
    setSelectedCountryCode(countryCode);
    setValue('recipient.owner.country', countryCode);
  }
  useEffect(() => {
    register({ name: 'recipient.owner.country' }, fields.country);
    setValue('recipient.owner.country', initialData?.recipient?.owner?.country || '');
  }, [register, initialData, setValue]);

  const hasErrors = Object.keys(errors).length !== 0;

  return (
    <form onSubmit={submit}>

      <Section>Bank account</Section>

      <FormField label="IBAN" name="recipient.iban" ref={register(fields.iban)} errors={errors} errorMessages={errorMessages} required />

      <FormField
        label="Reference (optional)"
        name="reference"
        ref={register(fields.reference)}
        errors={errors}
        errorMessages={errorMessages}
        placeholder="Bill A2313"
      />

      <Section>Personal informations</Section>

      <FormField label="Full Name" name="recipient.owner.name" ref={register(fields.name)} errors={errors} errorMessages={errorMessages} required />
      <FormField label="Address" name="recipient.owner.address" ref={register(fields.address)} errors={errors} errorMessages={errorMessages} required />
      <FormField label="Zip/Postal code" name="recipient.owner.zip" ref={register(fields.zip)} errors={errors} errorMessages={errorMessages} required />
      <FormField label="City" name="recipient.owner.city" ref={register(fields.city)} errors={errors} errorMessages={errorMessages} required />

      <FormField label="Country" name="recipient.owner.country" errors={errors} errorMessages={errorMessages} required >
        <CountrySelect
          countryCode={selectedCountryCode}
          onChange={setCountry}
          data-private
        />
      </FormField>

      {/*<Box mb={2} mt={1}>
        <Link onClick={() => setMore(!more)}>
          {more ? 'Show less' : 'Show more'}
        </Link>
      </Box>*/}

      {/*<Box display={more ? 'block' : 'none'}>
        <FormField label="BIC/SWIFT" name="bic_swift" ref={register(fields.bic_swift)} errors={errors} errorMessages={errorMessages} />
        <FormField label="Email" name="email" ref={register(fields.email)} errors={errors} errorMessages={errorMessages} />
      </Box>*/}

      {endComponent({ submit, hasErrors })}
    </form>
  )
}

export default RecipientForm;

