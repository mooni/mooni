import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';
import { IconArrowRight } from '@aragon/ui'

import {setRecipient, setReference} from '../../redux/payment/actions';
import {getRecipient, getReference} from '../../redux/payment/selectors';

import RecipientForm from './RecipientForm';
import {RoundButton} from "../UI/StyledComponents";

function StepRecipient({ onComplete }) {
  const recipient = useSelector(getRecipient);
  const reference = useSelector(getReference);
  const dispatch = useDispatch();

  async function onSubmit(data) {
    dispatch(setRecipient(data.recipient));
    dispatch(setReference(data.reference));
    onComplete();
  }

  const initialData = useMemo(() => ({
    recipient,
    reference,
  }), [recipient, reference]);

  return (
    <Box width={1}>
      <RecipientForm
        initialData={initialData}
        onSubmit={onSubmit}
        endComponent={({ submit, isValid }) => (
          <Box mt={2}>
            {/*<label className={classes.saveInfoRow}>
                <Checkbox
                  checked={saveAccountInfo}
                  onChange={onClickSaveData}
                />
                <Box mx={1}>Save my account information</Box>
                <Help hint="What does that mean ?">
                  Your bank account information can be stored so you don't have to type them again if you come back here.
                  The data is stored encrypted in a decentralized storage, so only you have access to it.
                </Help>
              </label>*/}
            <RoundButton mode="strong" onClick={submit} wide icon={<IconArrowRight/>} label="Next" disabled={!isValid} />
          </Box>
        )}
      />
    </Box>
  )
}

export default StepRecipient;
