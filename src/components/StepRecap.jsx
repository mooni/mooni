import React from 'react';
import { useSelector } from 'react-redux';

import { Box, Grid } from '@material-ui/core';
import { Button, Countdown, Info, IconArrowLeft, IconCoin } from '@aragon/ui'

import Loader from '../components/Loader';
import RecipientInfo from '../components/RecipientInfo';

import { getRecipient, getOrder, getOrderError } from '../redux/payment/selectors';

function StepRecap({ onComplete, onBackRecipient, onBackPaymentDetail }) {
  const recipient = useSelector(getRecipient);
  const order = useSelector(getOrder);
  const orderError = useSelector(getOrderError);

  // TODO retry create order after countdown expired

  if(orderError) {
    return (
      <Box width={1} py={3}>
        <Info title="Order error" mode="error">
          {orderError.map(error => (
            <Box key={error.code}><b>{error.code}</b> {error.message}</Box>
          ))}
        </Info>
        <Box pt={2}>
          <Button mode="normal" onClick={onBackPaymentDetail} wide icon={<IconArrowLeft/>} label="Go back" />
        </Box>
      </Box>
    );
  }

  return (
    <Box width={1} py={3}>
      <RecipientInfo recipient={recipient} />
      {
        order ?
          <>
            <Box pt={2}>
              <Info title="Payment details" mode="info">
                <Box><b>From:</b> {order.input.amount} {order.input.currency}</Box>
                <Box><b>To:</b> {order.output.amount} {order.output.currency}</Box>
                <Box><b>Fees:</b> {order.price_breakdown.customer_trading_fee.amount} {order.price_breakdown.customer_trading_fee.currency}</Box>
              </Info>
            </Box>
            <Box py={2}>
              <Info title="Price guaranteed until" mode="warning">
                <Countdown end={new Date(order.timestamp_price_guaranteed)} />
              </Info>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button mode="normal" onClick={onBackPaymentDetail} wide icon={<IconArrowLeft/>} label="Go back" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button mode="strong" onClick={onComplete} wide icon={<IconCoin />} label="Send payment" />
              </Grid>
            </Grid>
          </>
          :
          <Loader text="Creating order ..." />
      }
    </Box>
  )
}

export default StepRecap;
