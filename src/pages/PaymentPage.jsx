import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Stepper, Step, StepLabel } from '@material-ui/core'
import { Box as ABox } from '@aragon/ui'

import StepRecipient from '../components/StepRecipient';
import StepPaymentDetail from '../components/StepPaymentDetail';
import StepContact from '../components/StepContact';
import StepRecap from '../components/StepRecap';
import StepStatus from '../components/StepStatus';

import { CustomStepConnector, CustomStepIcon } from '../components/StepComponents';

import { createOrder, sendPayment, resetOrder } from '../redux/payment/actions';

function PaymentPage() {
  const [activeStep, setActiveStep] = useState(0);
  const history = useHistory();

  const dispatch = useDispatch();

  function onExit() {
    history.push('/');
  }
  function handleNext() {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }
  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  }
  function onEditRecap() {
    dispatch(resetOrder());
    setActiveStep(2);
  }
  function onSend() {
    dispatch(sendPayment());
    handleNext();
  }
  function onPrepareRecap() {
    dispatch(resetOrder());
    dispatch(createOrder());
    handleNext();
  }

  const steps = ['Recipient', 'Payment Detail', 'Contact', 'Recap', 'Status'];
  const stepElements = [
    <StepRecipient onComplete={handleNext} />,
    <StepPaymentDetail onComplete={handleNext} onBack={handleBack} />,
    <StepContact onComplete={onPrepareRecap} onBack={handleBack} />,
    <StepRecap onComplete={onSend} onBack={onEditRecap} />,
    <StepStatus onExit={onExit} onBack={onEditRecap} />,
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
