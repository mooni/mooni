import React from 'react';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';

import { Button, Countdown, Info, LoadingRing } from '@aragon/ui'
import { GroupLabel } from './StyledComponents';

import { getRecipient, getOrder } from '../redux/payment/selectors';

function StepRecap({ onComplete }) {
  const recipient = useSelector(getRecipient);
  const order = useSelector(getOrder);

  return (
    <Box width={1}>
      <GroupLabel>Recipient</GroupLabel>
      <Info title={recipient.owner.name}>
        <Box>{recipient.owner.address}</Box>
        <Box>{recipient.owner.zip} {recipient.owner.city} {recipient.owner.country}</Box>
        <Box>IBAN: {recipient.iban}</Box>
        <Box>BIC: {recipient.bic_swift}</Box>
      </Info>
      <GroupLabel>Payment details</GroupLabel>
      {
        order ?
          <Box>
            <Info>
              <Box>From: {order.input.amount} {order.input.currency}</Box>
              <Box>To: {order.output.amount} {order.output.currency}</Box>
              <Box>Fees: {order.price_breakdown.customer_trading_fee.amount} {order.price_breakdown.customer_trading_fee.currency}</Box>
              <Box>
                Price guaranteed until
                <Countdown end={new Date(order.timestamp_price_guaranteed)} />
              </Box>
            </Info>
            <Button mode="strong" onClick={onComplete} wide>Send payment</Button>
          </Box>
          :
          <Box display="flex" alignItems="center" justifyContent="center" py={2}>
            <Box>Creating order ...</Box>
            <LoadingRing />
          </Box>
      }
    </Box>
  )
}

export default StepRecap;
