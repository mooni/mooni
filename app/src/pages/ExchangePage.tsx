import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { Box } from '@material-ui/core'
import { ArrowBack } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles';
import { Box as ABox } from '@aragon/ui'

import RequireConnection from '../components/Utils/RequireConnection';
import StepNotice from '../components/Payment/StepNotice';
import StepRecipient from '../components/Payment/StepRecipient';
import StepPaymentDetail from '../components/Payment/StepPaymentDetail';
import StepAmount from '../components/Payment/StepAmount';
import StepRecap from '../components/Payment/StepRecap';
import { RoundButton, SmallWidth } from '../components/UI/StyledComponents';

import { CustomMobileStepper } from '../components/Payment/StepComponents';

import { createOrder, sendPayment, resetOrder, setExchangeStep } from '../redux/payment/actions';
import { getExchangeStep } from '../redux/payment/selectors';
import { useCurrenciesContext } from '../hooks/currencies';

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

export default function ExchangePage() {
  const { currenciesManager } = useCurrenciesContext();
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

            {stepId !== 0 && <Box mb={2}>
              <RoundButton
                wide
                onClick={handleBack}
                icon={<ArrowBack/>}
                label={"Back"}
                disabled={stepId === 0}
              />
            </Box>
            }
            {stepElements[stepId]}
          </RoundedBox>
        </SmallWidth>
      }
    </RequireConnection>
  );
}
