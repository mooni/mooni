import React from 'react';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';

import { Button, Countdown, Info, LoadingRing, IconArrowLeft, IconCoin } from '@aragon/ui'
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
      <Info title="Recipient">
        <Box>{recipient.owner.name}</Box>
        <Box>{recipient.owner.address}</Box>
        <Box>{recipient.owner.zip} {recipient.owner.city} {recipient.owner.country}</Box>
        <Box><b>IBAN:</b> {recipient.iban}</Box>
        <Box><b>BIC:</b> {recipient.bic_swift}</Box>
      </Info>
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
            <Box pt={2}>
              <Info title="Price guaranteed until" mode="warning">
                <Countdown end={new Date(order.timestamp_price_guaranteed)} />
              </Info>
            </Box>
            <Box pt={2}>
              <Button mode="strong" onClick={onComplete} wide icon={<IconCoin />} label="Send payment" />
            </Box>
            <Button mode="normal" onClick={onBackPaymentDetail} wide icon={<IconArrowLeft/>} label="Edit details" />
          </>
          :
          <Box pt={2} display="flex" alignItems="center" justifyContent="center">
            <Box>Creating order ...</Box>
            <LoadingRing />
          </Box>
      }
    </Box>
  )
}

export default StepRecap;
