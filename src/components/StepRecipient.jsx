import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import { Checkbox, Field, Button, IconArrowRight } from '@aragon/ui'

import { setRecipient } from '../redux/payment/actions';
import { getMyAccount } from '../redux/contacts/selectors';
import { getRecipient } from '../redux/payment/selectors';
import { getBoxLoading, getBoxManager } from '../redux/box/selectors';
import { updateMyAccount } from '../redux/contacts/actions';

import Loader from '../components/Loader';
import RecipientForm from './RecipientForm';
import RequireConnection from './RequireConnection';

const useStyles = makeStyles(() => ({
  fieldRow: {
    marginBottom: '15px',
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
            <Field className={classes.fieldRow}>
              <Checkbox
                checked={saveAccountInfo}
                onChange={setSaveAccountInfo}
              />
              Save my account information
            </Field>
            <Button mode="strong" onClick={submit} wide icon={<IconArrowRight/>} label="Save recipient" disabled={hasErrors} />
          </>
        )}
      />
    </Box>
  )
}

export default StepRecipient;
