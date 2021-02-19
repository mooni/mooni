import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { Box } from '@material-ui/core'
import { ArrowBack } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles';
import { Box as ABox } from '@aragon/ui'

import StepNotice from '../components/Payment/StepNotice';
import StepRecipient from '../components/Payment/StepRecipient';
import StepAmount from '../components/Payment/StepAmount';
import StepRecap from '../components/Payment/StepRecap';
import { RoundButton, SmallWidth } from '../components/UI/StyledComponents';

import { CustomMobileStepper } from '../components/Payment/StepComponents';

import { createOrder, sendPayment, resetOrder, setExchangeStep } from '../redux/payment/actions';
import { getExchangeStep } from '../redux/payment/selectors';

const useStyles = makeStyles({
  mobileStepperRoot: {
    maxWidth: 400,
    flexGrow: 1,
  },
  mobileStepperStepLabel: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.5,
    textTransform: 'uppercase',
    marginBottom: '14px',
  }
});

const RoundedBox = styled(ABox)`
  border-radius: 20px;
`

const steps = ['Amount', 'Recipient', 'Notice', 'Order summary'];

export default function ExchangePage() {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const stepId = useSelector(getExchangeStep);

  function handleNext() {
    dispatch(setExchangeStep(stepId + 1));
  }
  function handleBack() {
    dispatch(setExchangeStep(Math.max(0, stepId - 1)));
  }

  function handleStartOver() {
    dispatch(resetOrder());
    dispatch(setExchangeStep(0));
  }
  function onPrepareRecap() {
    dispatch(createOrder());
    handleNext();
  }
  function onSend() {
    dispatch(sendPayment());
    history.push('/status');
  }

  const stepElements = [
    <StepAmount onComplete={handleNext} />,
    <StepRecipient onComplete={handleNext} />,
    <StepNotice onComplete={onPrepareRecap} />,
    <StepRecap onComplete={onSend} onStartOver={handleStartOver} />,
  ];

  return (
    <SmallWidth>
      <RoundedBox>
        <CustomMobileStepper
          backButton={null}
          nextButton={null}
          activeStep={stepId}
          steps={stepElements.length}
          variant="progress"
          position="static"
          className={classes.mobileStepperRoot}
        />

        <Box textAlign="center" className={classes.mobileStepperStepLabel}>
          {steps[stepId]}
        </Box>

        {stepId !== 0 && stepId !== (stepElements.length - 1) && <Box mb={2}>
          <RoundButton
            wide
            onClick={handleBack}
            icon={<ArrowBack/>}
            label={"Back"}
          />
        </Box>
        }
        {stepElements[stepId]}
      </RoundedBox>
    </SmallWidth>
  );
}
