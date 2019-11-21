import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Field, TextInput, Button } from '@aragon/ui'
import { Box, CircularProgress } from '@material-ui/core';

import { getMyAccount } from '../redux/contacts/selectors';
import { getBoxManager } from '../redux/box/selectors';
import { fetchMyAccount } from '../redux/contacts/actions';

function MyAccountPage() {
  const boxManager = useSelector(getBoxManager);
  const myAccount = useSelector(getMyAccount);

  const nameInput = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (boxManager) {
      dispatch(fetchMyAccount());
    }
  }, [boxManager]);

  async function saveName() {
    const name = nameInput.current.value;
    console.log(name);
    if(!boxManager) throw new Error('boxManager not ready');
    await boxManager.setPrivate('name', name);
    console.log('set name');
    dispatch(fetchMyAccount());
  }

  if(!myAccount) {
    return (
      <Box mx="auto">
        Loading account
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box>
      My Account
      <Field label="Name">
        <TextInput wide ref={nameInput} defaultValue={myAccount.name} />
      </Field>
      <Button onClick={() => saveName()}>Save</Button>
    </Box>
  );
}

export default MyAccountPage;
