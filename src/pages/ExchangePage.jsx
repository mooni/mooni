import React  from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Box, Button } from '@material-ui/core'
import { ArrowBack } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles';
import { Box as ABox } from '@aragon/ui'

import RequireConnection from '../components/RequireConnection';
import StepRecipient from '../components/StepRecipient';
import StepPaymentDetail from '../components/StepPaymentDetail';
import StepAmount from '../components/StepAmount';
import StepRecap from '../components/StepRecap';
import { SmallWidth } from '../components/StyledComponents';

import { CustomMobileStepper } from '../components/StepComponents';

import { createOrder, sendPayment, resetOrder, setPaymentStep } from '../redux/payment/actions';
import { getPaymentStep } from '../redux/payment/selectors';

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

export default function ExchangePage() {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const stepId = useSelector(getPaymentStep);

  function handleNext() {
    dispatch(setPaymentStep(stepId + 1));
  }
  function handleBack() {
    if(stepId === 3) {
      dispatch(resetOrder());
    }
    dispatch(setPaymentStep(Math.max(0, stepId - 1)));
  }
  function onPrepareRecap() {
    dispatch(createOrder());
    handleNext();
  }
  function onSend() {
    dispatch(sendPayment());
    history.push('/status');
  }

  const steps = ['Amount', 'Recipient', 'Payment Details', 'Order summary'];
  const stepElements = [
    <StepAmount onComplete={handleNext} />,
    <StepRecipient onComplete={handleNext} />,
    <StepPaymentDetail onComplete={onPrepareRecap} />,
    <StepRecap onComplete={onSend} />,
  ];

  return (
    <RequireConnection>
      <SmallWidth>
        <ABox width={1} py={3}>
          <CustomMobileStepper
            activeStep={stepId}
            steps={stepElements.length}
            variant="progress"
            position="static"
            className={classes.mobileStepperRoot}
          />

          <Box textAlign="center" className={classes.mobileStepperStepLabel}>
            {steps[stepId]}
          </Box>

          {stepId !== 0 && <Box mb={2}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<ArrowBack/>}
              disabled={stepId === 0}
              style={{width: '100%'}}
              onClick={handleBack}
            >
              Back
            </Button>
          </Box>
          }
          {stepElements[stepId]}
        </ABox>
      </SmallWidth>
    </RequireConnection>
  );
}
