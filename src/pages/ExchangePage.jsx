import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';

import { Grid, Box } from '@material-ui/core';
import {Link, Button, IconRefresh, IconCoin, Info} from '@aragon/ui'

import RateForm from '../components/RateForm';
import Footer from '../components/Footer';
import {setAmountDetail, setPaymentStep} from '../redux/payment/actions';
import {getAmountDetail} from '../redux/payment/selectors';

const logoStyle = {
  fontSize: '5rem',
  cursor: 'default',
};

export default function Exchange() {
  const history = useHistory();
  const dispatch = useDispatch();
  const amountDetails = useSelector(getAmountDetail);
  const [rateRequest, setRateRequest] = useState(null);

  const onGoToSend = () => {
    if(rateRequest) {
      dispatch(setAmountDetail(rateRequest));
      dispatch(setPaymentStep(1));
    }
    history.push('/send');
  };

  return (
    <Box width={1} py={2}>
      <Box>
        <Info mode="error">
          Mooni is unaudited, please proceed with caution.
        </Info>
      </Box>
      <RateForm onChange={setRateRequest} defaultRateRequest={amountDetails}/>
      <Box pt={2}>
        <Button mode="strong" onClick={onGoToSend} wide label="Exchange" icon={<IconRefresh/>} />
      </Box>
    </Box>
  );
}
