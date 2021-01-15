import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Box, Button } from '@material-ui/core'
import { ArrowBack } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles';
import { Box as ABox } from '@aragon/ui'

import RequireConnection from '../components/Utils/RequireConnection';
import StepNotice from '../components/Payment/StepNotice';
import StepRecipient from '../components/Payment/StepRecipient';
import StepPaymentDetail from '../components/Payment/StepPaymentDetail';
import StepAmount from '../components/Payment/StepAmount';
import StepRecap from '../components/Payment/StepRecap';
import { SmallWidth } from '../components/UI/StyledComponents';

import { CustomMobileStepper } from '../components/Payment/StepComponents';

import { createOrder, sendPayment, resetOrder, setExchangeStep } from '../redux/payment/actions';
import { getExchangeStep } from '../redux/payment/selectors';
import { CurrenciesContext } from '../contexts/CurrenciesContext';

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
  const { currenciesManager } = useContext(CurrenciesContext);
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const stepId = useSelector(getExchangeStep);

  function handleNext() {
    dispatch(setExchangeStep(stepId + 1));
  }
  function handleBack() {
    if(stepId === 4) {
      dispatch(resetOrder());
    }
    dispatch(setExchangeStep(Math.max(0, stepId - 1)));
  }
  function onPrepareRecap() {
    dispatch(createOrder());
    handleNext();
  }
  function onSend() {
    dispatch(sendPayment(currenciesManager));
    history.push('/status');
  }

  const steps = ['Amount', 'Recipient', 'Payment Details', 'Notice', 'Order summary'];
  const stepElements = [
    <StepAmount onComplete={handleNext} />,
    <StepRecipient onComplete={handleNext} />,
    <StepPaymentDetail onComplete={handleNext} />,
    <StepNotice onComplete={onPrepareRecap} />,
    <StepRecap onComplete={onSend} />,
  ];

  return (
    <RequireConnection>
      {() =>
        <SmallWidth>
          <ABox width={1} py={3}>
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
      }
    </RequireConnection>
  );
}
