import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';
import { IconArrowRight } from '@aragon/ui'

import {setRecipient, setReference} from '../../redux/payment/actions';
import {getRecipient, getReference} from '../../redux/payment/selectors';
// import { getBoxManager } from '../../redux/box/selectors';
// import { updateMyAccount } from '../../redux/contacts/actions';

import RecipientForm from './RecipientForm';
import {BoxLoadingContainer, BoxModal} from '../Utils/RequireBox';
import {RoundButton} from "../UI/StyledComponents";

// const useStyles = makeStyles(() => ({
//   saveInfoRow: {
//     marginBottom: '15px',
//     display: 'flex',
//     alignItems: 'center',
//   },
// }));

function StepRecipient({ onComplete }) {
  // const classes = useStyles();
  const recipient = useSelector(getRecipient);
  const reference = useSelector(getReference);
  // const boxManager = useSelector(getBoxManager);
  const dispatch = useDispatch();
  // const [saveAccountInfosaveAccountInfo, setSaveAccountInfo] = useState(false);
  const [showBoxModal, setShowBoxModal] = useState(false);

  async function onSubmit(data) {
    dispatch(setRecipient(data.recipient));
    dispatch(setReference(data.reference));
    // if(saveAccountInfo) {
    //   await dispatch(updateMyAccount(data));
    // }
    onComplete();
  }

  /*
  function onClickSaveData(value) {
    if(boxManager) {
      setSaveAccountInfo(!saveAccountInfo);
    } else {
      setShowBoxModal(true);
    }
  }
   */
  const initialData = useMemo(() => ({
    recipient,
    reference,
  }), [recipient, reference]);

  return (
    <BoxLoadingContainer>
      <Box width={1}>
        <BoxModal visible={showBoxModal} onClose={() => setShowBoxModal(false)}/>

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
    </BoxLoadingContainer>
  )
}

export default StepRecipient;
