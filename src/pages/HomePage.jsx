import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';

import { Box, Typography } from '@material-ui/core';
import {Button, IconRefresh, Info} from '@aragon/ui'

import RateForm from '../components/RateForm';
import {setRateRequest, setPaymentStep} from '../redux/payment/actions';
import {getRateRequest} from '../redux/payment/selectors';

export default function HomePage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const defaultRateRequest = useSelector(getRateRequest);
  const [rateRequest, setLocalRateRequest] = useState(null);
  const [rateValid, setRateValid] = useState(false);

  const onGoToExchange = () => {
    if(rateRequest) {
      dispatch(setRateRequest(rateRequest));
      dispatch(setPaymentStep(1));
    }
    history.push('/exchange');
  };

  return (
    <Box width={1} py={2}>
      <Box textAlign="center">
        <Typography variant="subtitle1">
          Transfer funds from your crypto wallet to your bank account.
        </Typography>
      </Box>
      <RateForm onChange={setLocalRateRequest} onValid={setRateValid} defaultRateRequest={defaultRateRequest}/>
      <Button mode="strong" onClick={onGoToExchange} wide label="Exchange" icon={<IconRefresh/>} disabled={!rateValid} />
      <Box pt={2}>
        <Info mode="error">
          Mooni is unaudited, please proceed with caution.
        </Info>
      </Box>
    </Box>
  );
}
