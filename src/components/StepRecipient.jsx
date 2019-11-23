import React from 'react';
import useForm from 'react-hook-form';
import IBAN from 'iban';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';
import { Button, Field, TextInput } from '@aragon/ui'
import { GroupLabel, WideInput } from './StyledComponents';

import { setRecipient } from '../redux/payment/actions';
import { getRecipient } from '../redux/payment/selectors';


function StepRecipient({ onComplete }) {
  const { register, handleSubmit, errors } = useForm();

  const recipient = useSelector(getRecipient);
  const dispatch = useDispatch();

  const onSubmit = handleSubmit(async data => {
    dispatch(setRecipient(data));
    onComplete();
  });

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
    <Box width={1}>
      <form onSubmit={onSubmit}>
        <GroupLabel>Recipient</GroupLabel>
        <Field label="IBAN">
          <WideInput name="iban" ref={register(fields.iban)} defaultValue={recipient.iban} required/>
          {errors.iban && <Box>Invalid IBAN</Box>}
        </Field>
        <Field label="BIC/SWIFT">
          <WideInput name="bic_swift" ref={register(fields.bic_swift)} defaultValue={recipient.bic_swift} required/>
          {errors.bic_swift && <Box>Invalid BIC</Box>}
        </Field>
        <Field label="Name">
          <WideInput name="owner.name" ref={register(fields.name)} defaultValue={recipient.owner.name} required/>
          {errors['owner.name'] && <Box>Please enter your name</Box>}
        </Field>
        <Field label="Address">
          <WideInput name="owner.address" ref={register(fields.address)} defaultValue={recipient.owner.address} required/>
          {errors['owner.address'] && <Box>Invalid address</Box>}
        </Field>
        <Field label="Zip/Postal code">
          <WideInput name="owner.zip" ref={register(fields.zip)}  defaultValue={recipient.owner.zip} required/>
          {errors['owner.zip'] && <Box>Invalid Zip/Code</Box>}
        </Field>
        <Field label="City">
          <WideInput name="owner.city" ref={register(fields.city)}  defaultValue={recipient.owner.city} required/>
          {errors['owner.city'] && <Box>Invalid city</Box>}
        </Field>
        <Field label="Country">
          <WideInput name="owner.country" ref={register(fields.country)}  defaultValue={recipient.owner.country} required/>
          {errors['owner.country'] && <Box>Invalid country</Box>}
        </Field>
        <Button mode="strong" onClick={onSubmit} wide>Save recipient</Button>
      </form>
    </Box>
  )
}

/*
        <Box>
          Send funds to
        </Box>
        <TabBar
          items={['Me', 'Existing contact', 'New contact']}
          selected={contactType}
          onChange={setContactType}
        />
        {
          contactType === 0 &&
          <Info title="My information">
            <b>Name:</b> {accountInformation.name} <br/>
            <b>IBAN:</b> {accountInformation.iban}
          </Info>
        }
        {
          contactType === 1 &&
          <DropDown
            items={contacts}
            active={selectedContact}
            onChange={setSelectedContact}
          />
        }{
        contactType === 2 &&
        <div>
          <Field label="Name">
            <TextInput value={contactName} onChange={e => setContactName(e.target.value)}/>
          </Field>
          <Field label="IBAN">
            <TextInput/>
          </Field>
        </div>
      }
 */

export default StepRecipient;
