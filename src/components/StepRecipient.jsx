import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import { Tabs, EmptyStateCard, Button, IconArrowRight } from '@aragon/ui'

import { setRecipient } from '../redux/payment/actions';
import { getMyAccount } from '../redux/contacts/selectors';
import { getRecipient } from '../redux/payment/selectors';
import { getBoxManager } from '../redux/box/selectors';
import { initBox } from '../redux/box/actions';
import { fetchMyAccount } from '../redux/contacts/actions';

import RecipientForm from './RecipientForm';
import RecipientInfo from '../components/RecipientInfo';
import RequireConnection from './RequireConnection';

function StepRecipient({ onComplete }) {
  const myAccount = useSelector(getMyAccount);
  const recipient = useSelector(getRecipient);
  const boxManager = useSelector(getBoxManager);
  const dispatch = useDispatch();
  const history = useHistory();

  const [contactType, setContactType] = useState(0);
  const [connecting, setConnecting] = useState(false);

  const goToAccountPage = () => history.push('/my-account');

  function onSubmit(data) {
    dispatch(setRecipient(data));
    onComplete();
  }
  function onSendToMe() {
    dispatch(setRecipient(myAccount));
    onComplete();
  }

  async function login3box() {
    setConnecting(true);
    await dispatch(initBox());
    await dispatch(fetchMyAccount());
    setConnecting(false);
  }

  return (
    <Box width={1}>
      <Box width={276} mx="auto">
        <Tabs
          items={['New recipient', 'My account']}
          selected={contactType}
          onChange={setContactType}
        />
      </Box>
      {
        contactType === 0 &&
        <RecipientForm initialRecipient={recipient} onSubmit={onSubmit}/>
      }
      {
        contactType === 1 &&
        <RequireConnection eth box>
          {
            myAccount ?
              <>
                <RecipientInfo recipient={myAccount}/>
                <Box pt={2}>
                  <Button mode="strong" onClick={onSendToMe} wide icon={<IconArrowRight/>}
                          label="Send to my account"/>
                </Box>
              </>
              :
              <Box display="flex" justifyContent="center">
                <EmptyStateCard
                  text="You don't have set your account yet."
                  action={<Button onClick={goToAccountPage}>Set my account</Button>}
                />
              </Box>
          }
        </RequireConnection>
      }
      {/*
        contactType === 1 &&
        <DropDown
          items={contacts}
          active={selectedContact}
          onChange={setSelectedContact}
        />
      */}
    </Box>
  )
}

export default StepRecipient;
