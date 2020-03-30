import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';

import { Box, Typography } from '@material-ui/core';
import {Button, IconRefresh, Info} from '@aragon/ui'

import RateForm from '../components/RateForm';
import {setRateRequest, setPaymentStep} from '../redux/payment/actions';
import {getRateRequest} from '../redux/payment/selectors';

export default function Exchange() {
  const history = useHistory();
  const dispatch = useDispatch();
  const defaultRateRequest = useSelector(getRateRequest);
  const [rateRequest, setLocalRateRequest] = useState(null);

  const onGoToSend = () => {
    if(rateRequest) {
      dispatch(setRateRequest(rateRequest));
      dispatch(setPaymentStep(1));
    }
    history.push('/send');
  };

  return (
    <Box width={1} py={2}>
      <Box textAlign="center">
        <Typography variant="subtitle1">
          Transfer funds from your crypto wallet to your bank account.
        </Typography>
      </Box>
      <RateForm onChange={setLocalRateRequest} defaultRateRequest={defaultRateRequest}/>
      <Button mode="strong" onClick={onGoToSend} wide label="Exchange" icon={<IconRefresh/>} />
      <Box pt={2}>
        <Info mode="error">
          Mooni is unaudited, please proceed with caution.
        </Info>
      </Box>
    </Box>
  );
}
