import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import BN from 'bignumber.js';

import { Box, Grid } from '@material-ui/core';
import { Button, Countdown, Info, IconArrowLeft, IconCoin, Checkbox, Link, Modal } from '@aragon/ui'

import Terms from '../components/Terms';
import Loader from '../components/Loader';
import RecipientInfo from '../components/RecipientInfo';

import { getRecipient, getPaymentOrder, getOrderErrors } from '../redux/payment/selectors';

function StepRecap({ onComplete, onBack }) {
  const recipient = useSelector(getRecipient);
  const paymentOrder = useSelector(getPaymentOrder);
  const orderErrors = useSelector(getOrderErrors);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpened, setTermsOpened] = useState(false);

  // TODO retry create order after countdown expired

  if(orderErrors) {
    return (
      <Box width={1} py={3}>
        <Info title="Order error" mode="error">
          {orderErrors.map(error => (
            <Box key={error.code}><b>{error.code}</b> {error.message}</Box>
          ))}
        </Info>
        <Box pt={2}>
          <Button mode="normal" onClick={onBack} wide icon={<IconArrowLeft/>} label="Go back" />
        </Box>
      </Box>
    );
  }

  return (
    <Box width={1} py={3}>
      <RecipientInfo recipient={recipient} />
      <Box mt={2}/>
      {
        paymentOrder ?
          <>
            <Info title="Payment details" mode="info">
              <Box pt={2}>
                {paymentOrder.path === 'DEX_BITY' ?
                  <>
                    <Box><b>From:</b> {paymentOrder.tokenRate.inputAmount} {paymentOrder.tokenRate.inputCurrency}</Box>
                    <Box><b>Rate:</b> ~{BN(paymentOrder.bityOrder.output.amount).div(paymentOrder.tokenRate.inputAmount).dp(3).toString()} {paymentOrder.bityOrder.output.currency}/{paymentOrder.tokenRate.inputCurrency} </Box>
                  </>
                  :
                  <>
                    <Box><b>From:</b> {paymentOrder.bityOrder.input.amount} {paymentOrder.bityOrder.input.currency}</Box>
                    <Box><b>Rate:</b> ~{BN(paymentOrder.bityOrder.output.amount).div(paymentOrder.bityOrder.input.amount).dp(3).toString()} {paymentOrder.bityOrder.output.currency}/{paymentOrder.bityOrder.input.currency} </Box>
                  </>
                }
                <Box><b>To:</b> {paymentOrder.bityOrder.output.amount} {paymentOrder.bityOrder.output.currency}</Box>
                <Box><b>Fees:</b> {paymentOrder.bityOrder.price_breakdown.customer_trading_fee.amount} {paymentOrder.bityOrder.price_breakdown.customer_trading_fee.currency}</Box>
              </Box>
            </Info>
            <Box pt={2}>
              <Info title="Price guaranteed until" mode="warning">
                <Countdown end={new Date(paymentOrder.bityOrder.timestamp_price_guaranteed)} />
              </Info>
            </Box>
            <Box py={2} display="flex" justifyContent="center">
              <label>
                <Checkbox
                  checked={termsAccepted}
                  onChange={setTermsAccepted}
                />
                I agree with the <Link onClick={() => setTermsOpened(true)}>terms of service</Link>
              </label>
              <Modal visible={termsOpened} onClose={() => setTermsOpened(false)}>
                <Box>
                  <Terms />
                </Box>
              </Modal>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button mode="normal" onClick={onBack} wide icon={<IconArrowLeft/>} label="Go back" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button mode="strong" onClick={onComplete} wide icon={<IconCoin />} disabled={!termsAccepted} label="Send payment" />
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
