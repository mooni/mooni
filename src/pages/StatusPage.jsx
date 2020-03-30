import React, { useState, useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';

import { Box, Typography } from '@material-ui/core';
import {Button, IconClock, LoadingRing, IconArrowLeft, IconHome, IconCheck, IconCaution, IconExternal, useTheme, textStyle} from '@aragon/ui'
import { useHistory } from 'react-router-dom';

import Loader from '../components/Loader';
import Bity from '../lib/bity';
import { getEtherscanTxURL } from '../lib/eth';

import { getPaymentOrder, getPaymentStatus, getPaymentTransaction } from '../redux/payment/selectors';
import {resetOrder, setPaymentStep, setPaymentTransaction} from '../redux/payment/actions';
import styled from 'styled-components';

const POLL_INTERVAL = 2000;
function useUpdatedOrder(orderId, paymentStatus) {
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if(!orderId) return;

    let intervalId;

    function fetchNewData() {
      Bity.getOrderDetails(orderId)
        .then(newOrderDetails => {
          setOrderDetails(newOrderDetails);
          if(newOrderDetails.orderStatus === 'executed' || newOrderDetails.orderStatus === 'cancelled') {
            clearInterval(intervalId);
          }
        })
        .catch(console.error);
    }
    fetchNewData();

    if(paymentStatus === 'mined')
      intervalId = setInterval(fetchNewData, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [orderId, paymentStatus]);

  return orderDetails;
}

const Title = styled.p`
  ${textStyle('title3')};
  text-align: center;
`;

// TODO Support opening this page with /:orderId without tracking blockchain transaction state

export default function StepStatus() {
  const history = useHistory();
  const dispatch = useDispatch();
  const theme = useTheme();

  const paymentStatus = useSelector(getPaymentStatus);
  const paymentOrder = useSelector(getPaymentOrder);
  const paymentTransaction = useSelector(getPaymentTransaction);

  const orderDetails = useUpdatedOrder(paymentOrder?.bityOrder?.id, paymentStatus);

  if(!paymentOrder) {
    history.push('/');
  }

  function onRestart() {
    dispatch(resetOrder());
    dispatch(setPaymentTransaction(null));
    dispatch(setPaymentStep(0));
    history.push('/send');
  }
  function onExit() {
    history.push('/');
  }


  if(!orderDetails) {
    return (
      <Loader text="Loading order status..." />
    )
  }

  let content;

  if(paymentStatus ===  'approval') {
    content = <Loader text="Please approve transaction in your wallet" />;
  } else if(paymentStatus ===  'check-allowance') {
    content = <Loader text="Please approve Uniswap to spend your tokens in your wallet" />;
  } else if(paymentStatus ===  'mining-allowance') {
    content = <Loader text="Mining allowance..." />;
  } else if(paymentStatus ===  'mining-payment') {
    content = <Loader text="Mining payment..." />;

    // ERROR
  } else if(paymentStatus ===  'error') {
    content = (
      <Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <IconCaution size="large" style={{ color: theme.negative }}  />
        </Box>
        <Box py={2} textAlign="center" color="text.primary">
          An error occurred while trying to send the transaction. Please retry later.
        </Box>
        <Button mode="normal" onClick={onRestart} wide icon={<IconArrowLeft/>} label="Retry" />
      </Box>
    );

    // MINED, cancelled
  } else if(paymentStatus ===  'mined' && orderDetails.orderStatus === 'cancelled') {
    content = (
      <Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <IconCaution size="large" style={{ color: theme.negative }} />
        </Box>
        <Box py={2} textAlign="center">
          <Box>
            Bity has cancelled the order.
          </Box>
          <Box>
            Please contact their support service with your order id:
          </Box>
          <Typography variant="caption ">
            {orderDetails.id}
          </Typography>
        </Box>
        <Button mode="normal" onClick={onExit} wide icon={<IconHome/>} label="Go home" />
      </Box>
    );

    // MINED, executed
  } else if(paymentStatus ===  'mined' && orderDetails.orderStatus === 'executed') {
    content = (
      <Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <IconCheck size="large" style={{ color: theme.positive }} />
        </Box>
        <Box py={2} textAlign="center">
          <Box>
            The exchange is done and the wire transfer has been initiated.
          </Box>
          <Box>
            Bank transfers take from hours to days to arrive, please be patient.
          </Box>
        </Box>
        <Button mode="normal" onClick={onExit} wide icon={<IconHome/>} label="Go home" />
      </Box>
    );

    // MINED, waiting
  } else if(paymentStatus ===  'mined' && (orderDetails.orderStatus === 'waiting' || orderDetails.paymentStatus === 'received')) {
    content = (
      <Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <IconClock size="large" style={{ color: theme.warningSurfaceContent }} />
        </Box>
        <Box py={2} textAlign="center">
          <Box>
            Transaction successfuly sent.
          </Box>
          <Box>
            {orderDetails.orderStatus === 'waiting' && 'Waiting for Bity to catch it...'}
            {orderDetails.orderStatus === 'received' && 'Bity has received the transaction, waiting for confirmation...'}
            <Box display="flex" justifyContent="center"><LoadingRing/></Box>
          </Box>
        </Box>
      </Box>
    );

    // ??
  } else {
    content = (
      <Box>
        Unknown status ({paymentStatus}, {orderDetails.orderStatus})
      </Box>
    );
  }

  return (
    <Box width={1}>
      <Title>
        Order status
      </Title>

      {content}

      <Box my={1}>
        {paymentTransaction && <Button href={getEtherscanTxURL(paymentTransaction.hash)} wide icon={<IconExternal style={{color: theme.accent}}/>} label="Open transaction" />}
        <Box mt={1}/>
        {paymentTransaction && orderDetails && <Button href={Bity.getOrderStatusPageURL(orderDetails.id)} wide icon={<IconExternal style={{color: theme.accent}}/>} label="Open Bity order" />}
      </Box>
    </Box>
  )
}
