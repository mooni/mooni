import React from 'react';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';

import { Button, Countdown, Info, LoadingRing } from '@aragon/ui'
import { getRecipient, getOrder } from '../redux/payment/selectors';

function StepRecap({ onComplete, onBackRecipient, onBackPaymentDetail }) {
  const recipient = useSelector(getRecipient);
  const order = useSelector(getOrder);

  // TODO retry create order after countdown expired

  return (
    <Box width={1} py={3}>
      <Info title="Recipient">
        <Box>{recipient.owner.name}</Box>
        <Box>{recipient.owner.address}</Box>
        <Box>{recipient.owner.zip} {recipient.owner.city} {recipient.owner.country}</Box>
        <Box><b>IBAN:</b> {recipient.iban}</Box>
        <Box><b>BIC:</b> {recipient.bic_swift}</Box>
      </Info>
      <Button mode="normal" onClick={onBackRecipient} wide>Edit recipient</Button>
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
              <Button mode="strong" onClick={onComplete} wide>Send payment</Button>
            </Box>
            <Button mode="normal" onClick={onBackPaymentDetail} wide>Edit amount</Button>
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
