import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';

import { setRecipient } from '../redux/payment/actions';
import { getRecipient } from '../redux/payment/selectors';
import RecipientForm from './RecipientForm';

function StepRecipient({ onComplete }) {
  const recipient = useSelector(getRecipient);
  const dispatch = useDispatch();

  function onSubmit(data) {
    dispatch(setRecipient(data));
    onComplete();
  }

  return (
    <Box width={1}>
      <RecipientForm initialRecipient={recipient} onSubmit={onSubmit}/>
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
