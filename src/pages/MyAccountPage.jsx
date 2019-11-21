import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Text, Field, TextInput, Button } from '@aragon/ui'
import { Box, CircularProgress } from '@material-ui/core';

import BoxManager from '../lib/box';

import { getConnect } from '../redux/eth/selectors';
import { getMyAccount } from '../redux/contacts/selectors';
import { setMyAccount } from '../redux/contacts/actions';
import { getBoxManager } from '../redux/box/selectors';
import { setBoxManager } from '../redux/box/actions';

function MyAccountPage() {
  const connect = useSelector(getConnect);
  const boxManager = useSelector(getBoxManager);
  const myAccount = useSelector(getMyAccount);

  const nameInput = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
      if(!connect) throw new Error('connect not ready');
      BoxManager.init(connect).then(async (boxManager) => {
        dispatch(setBoxManager(boxManager));

        const name = await boxManager.getPrivate('name');
        dispatch(setMyAccount({
          name: name,
        }));
      });
    },
    [],
  );

  async function saveName() {
    const name = nameInput.current.value;
    console.log(name);
    if(!boxManager) throw new Error('boxManager not ready');
    await boxManager.setPrivate('name', name);
    console.log('set name');
  }

  if(!boxManager) {
    return (
      <Box mx="auto">
        Loading 3box
        <CircularProgress />
      </Box>
    );
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
    <Text>
      My Account
      <Field label="Name">
        <TextInput wide ref={nameInput} defaultValue={myAccount.name} />
      </Field>
      <Button onClick={() => saveName()}>Save</Button>
    </Text>
  );
}

export default MyAccountPage;
