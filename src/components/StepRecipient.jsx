 import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import { Checkbox, Button, IconArrowRight, Help } from '@aragon/ui'

import { setRecipient } from '../redux/payment/actions';
import { getMyAccount } from '../redux/contacts/selectors';
import { getRecipient } from '../redux/payment/selectors';
import { getBoxLoading, getBoxManager } from '../redux/box/selectors';
import { updateMyAccount } from '../redux/contacts/actions';

import Loader from '../components/Loader';
import RecipientForm from './RecipientForm';
import RequireConnection from './RequireConnection';

const useStyles = makeStyles(() => ({
  saveInfoRow: {
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
  },
}));

function StepRecipient({ onComplete }) {
  const classes = useStyles();
  const myAccount = useSelector(getMyAccount);
  const recipient = useSelector(getRecipient);
  const boxManager = useSelector(getBoxManager);
  const boxLoading = useSelector(getBoxLoading);
  const dispatch = useDispatch();
  const [saveAccountInfo, setSaveAccountInfo] = useState(false);
  const [requireBox, setRequireBox] = useState(false);

  function onSubmit(data) {
    dispatch(setRecipient(data));
    if(saveAccountInfo) {
      setRequireBox(true);
    } else {
      onComplete();
    }
  }

  useEffect(() => {
    async function save() {
      await dispatch(updateMyAccount(recipient));
      onComplete();
    }
    if(requireBox && boxManager) {
      save().catch(console.error);
    }
  }, [dispatch, onComplete, requireBox, boxManager, recipient]);

  if(requireBox) {
    return (
      <RequireConnection eth box>
        <Loader text="Saving account information..." />
      </RequireConnection>
    );
  }

  if(boxLoading)
    return <Loader text="Loading 3box" />;

  return (
    <Box width={1}>
      <RecipientForm
        initialRecipient={recipient || myAccount}
        allowFill={true}
        onSubmit={onSubmit}
        endComponent={({ submit, hasErrors }) => (
          <>
            <label className={classes.saveInfoRow}>
              <Checkbox
                checked={saveAccountInfo}
                onChange={setSaveAccountInfo}
              />
              <Box mx={1}>Save my account information</Box>
              <Help hint="What does this mean ?">
                Your bank account information can be stored so you don't have to type them again if you come back here.
                The data is stored encrypted in a decentralized storage, so only you have access to.
              </Help>
            </label>
            <Button mode="strong" onClick={submit} wide icon={<IconArrowRight/>} label="Save recipient" disabled={hasErrors} />
          </>
        )}
      />
    </Box>
  )
}

export default StepRecipient;
