import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Box } from '@material-ui/core';
import { Flex } from '@chakra-ui/react';
import { ArrowBack } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles';

import StepNotice from '../components/Payment/StepNotice';
import StepRecipient from '../components/Payment/StepRecipient';
import StepAmount from '../components/Payment/StepAmount';
import { RoundButton, SmallWidth, Surface } from '../components/UI/StyledComponents';

import { CustomMobileStepper } from '../components/Payment/StepComponents';

import { createOrder, resetOrder, setExchangeStep } from '../redux/payment/actions';
import { getExchangeStep, getOrderErrors } from '../redux/payment/selectors';
import OrderError from '../components/Payment/OrderError';
import Loader from '../components/UI/Loader';
import { ForceModal } from '../components/UI/Modal';

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

const steps = ['Amount', 'Recipient', 'Notice', 'Order summary'];

export default function ExchangePage() {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const stepId = useSelector(getExchangeStep);
  const orderErrors = useSelector(getOrderErrors);
  const [creatingOrder, setCreatingOrder] = useState<boolean>(false);

  function handleNext() {
    dispatch(setExchangeStep(stepId + 1));
  }
  function handleBack() {
    dispatch(setExchangeStep(Math.max(0, stepId - 1)));
  }

  function onCreateOrder() {
    setCreatingOrder(true);
    dispatch(createOrder())
      .then(() => {
        history.push('/payment');
      })
      .catch(_ => undefined)
      .finally(() => {
        setCreatingOrder(false);
      });
  }

  function onRestart(home: boolean = false) {
    // TODO Cancel order
    dispatch(resetOrder());
    dispatch(setExchangeStep(0));
    history.push(home ? '/' : '/exchange');
  }

  if(orderErrors) {
    return (
      <SmallWidth>
        <Surface px={4} py={8} mt={4} boxShadow="medium">
          <OrderError orderErrors={orderErrors} onStartOver={onRestart}/>
        </Surface>
      </SmallWidth>
    );
  }

  if(creatingOrder) {
    return (
      <ForceModal>
        <Flex justify="center" mt={4}>
          <Loader text="Creating order ..." />
        </Flex>
      </ForceModal>
    );
  }

  const stepElements = [
    <StepAmount onComplete={handleNext} />,
    <StepRecipient onComplete={handleNext} />,
    <StepNotice onComplete={onCreateOrder} />,
  ];

  return (
    <SmallWidth>
      <Surface boxShadow="medium" px={4} pt={4} pb={8} my={4}>
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
          />
        </Box>
        }
        {stepElements[stepId]}
      </Surface>
    </SmallWidth>
  );
}
