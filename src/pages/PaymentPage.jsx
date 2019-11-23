import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { Stepper, Step, StepLabel } from '@material-ui/core'
import { Box as ABox } from '@aragon/ui'

import StepRecipient from '../components/StepRecipient';
import StepPaymentDetail from '../components/StepPaymentDetail';
import StepRecap from '../components/StepRecap';
import { CustomStepConnector, CustomStepIcon } from '../components/StepComponents';


import { createOrder, sendPayment } from '../redux/payment/actions';

function PaymentPage() {
  const [activeStep, setActiveStep] = useState(0);

  const dispatch = useDispatch();

  function handleNext() {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }
  function onBackRecipient() {
    setActiveStep(0);
  }
  function onBackPaymentDetail() {
    setActiveStep(1);
  }
  function onFinish() {
    dispatch(sendPayment());
    handleNext();
  }
  function onPrepareRecap() {
    dispatch(createOrder());
    handleNext();
  }

  const steps = ['Recipient', 'Payment Detail', 'Recap'];
  const stepElements = [
    <StepRecipient onComplete={handleNext} />,
    <StepPaymentDetail onComplete={onPrepareRecap} onBackRecipient={onBackRecipient} />,
    <StepRecap onComplete={onFinish} onBackRecipient={onBackRecipient} onBackPaymentDetail={onBackPaymentDetail} />,
  ];

  return (
    <ABox width={1} py={3}>
      <Stepper alternativeLabel activeStep={activeStep} connector={<CustomStepConnector />}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {stepElements[activeStep]}
    </ABox>
  );
}

export default PaymentPage;
