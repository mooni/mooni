import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Box from '@material-ui/core/Box';
import { Button, Box as ABox } from '@aragon/ui'

import StepRecipient from '../components/StepRecipient';
import StepPaymentDetail from '../components/StepPaymentDetail';
import StepRecap from '../components/StepRecap';

import { createOrder, sendPayment } from '../redux/payment/actions';

function PaymentPage() {
  const [step, setStep] = useState(1);

  const dispatch = useDispatch();

  function onFinish() {
    dispatch(sendPayment());
    setStep(4);
  }

  function onPrepareRecap() {
    dispatch(createOrder());
    setStep(3);
  }

  return (
    <ABox width={1} py={3}>
      <Box>Step: {step}</Box>
      {
        step !== 1 && step < 4 &&
        <Button onClick={() => setStep(step-1)} wide>Back</Button>
      }
      {
        step === 1 &&
        <StepRecipient onComplete={() => setStep(2)}/>
      }
      {
        step === 2 &&
        <StepPaymentDetail onComplete={onPrepareRecap}/>
      }
      {
        step === 3 &&
        <StepRecap onComplete={onFinish} />
      }
      {
        step === 4 &&
        <Box>Success</Box>
      }
      {
        step === 5 &&
        <Box>Error</Box>
      }
    </ABox>
  );
}

export default PaymentPage;
