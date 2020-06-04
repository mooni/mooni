import React from 'react';
import BN from 'bignumber.js';

import { Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import { LoadingRing, textStyle, Button, IconRefresh } from '@aragon/ui'
import styled from 'styled-components';

import AmountRow from './AmountRow';

import { TradeExact } from '../lib/types';

import { getInputCurrencies } from '../redux/ui/selectors';

import {
  FIAT_CURRENCIES,
  SIGNIFICANT_DIGITS,
} from '../lib/currencies';
import { useRate } from '../hooks/rates';
import { getETHManager } from '../redux/eth/selectors';

const InvalidMessage = styled.p`
  ${textStyle('body4')};
  color: #e61b1b;
`;

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
  },
  additionalInfo: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
  },
}));

const outputCurrencies = FIAT_CURRENCIES;

function RateForm({ onSubmit = () => null, initialRateRequest, buttonLabel = 'Exchange', buttonIcon = <IconRefresh /> }) {
  const classes = useStyles();
  const inputCurrencies = useSelector(getInputCurrencies);
  const ethManager = useSelector(getETHManager);
  const { rateForm, onChangeAmount, onChangeCurrency, rateRequest, LOW_OUTPUT_AMOUNT, HIGH_OUTPUT_AMOUNT } = useRate(initialRateRequest);

  let rate, feeAmount;
  if(rateForm) {
    rate = new BN(rateForm.values.outputAmount).div(rateForm.values.inputAmount).sd(SIGNIFICANT_DIGITS).toFixed();
  }

  if(rateForm.values.fees) {
    if(outputCurrencies.includes(rateForm.values.fees.currency)) {
      feeAmount = new BN(rateForm.values.fees.amount).dp(2).toFixed();
    } else {
      feeAmount = new BN(rateForm.values.fees.amount).sd(SIGNIFICANT_DIGITS).toFixed();
    }
  }

  const valid = !(rateForm.loading || rateForm.errors);
  const errors = rateForm.errors && Object.keys(rateForm.errors);

  function submit() {
    if(!valid) return;
    onSubmit(rateRequest);
  }

  return (
    <>
      <AmountRow
        value={rateForm.values.inputAmount}
        currencies={inputCurrencies}
        currency={rateForm.values.inputCurrency}
        onChangeCurrency={onChangeCurrency(TradeExact.INPUT)}
        onChangeValue={onChangeAmount(TradeExact.INPUT)}
        active={rateForm.values.tradeExact === TradeExact.INPUT}
        valueDisabled={rateForm.values.tradeExact === TradeExact.OUTPUT && rateForm.loading}
        error={!rateForm.loading && rateForm.values.tradeExact === TradeExact.INPUT && !!errors}
        caption="Send"
      />
      <AmountRow
        value={rateForm.values.outputAmount}
        currencies={outputCurrencies}
        currency={rateForm.values.outputCurrency}
        onChangeCurrency={onChangeCurrency(TradeExact.OUTPUT)}
        onChangeValue={onChangeAmount(TradeExact.OUTPUT)}
        active={rateForm.values.tradeExact === TradeExact.OUTPUT}
        valueDisabled={rateForm.values.tradeExact === TradeExact.INPUT && rateForm.loading}
        error={!rateForm.loading && rateForm.values.tradeExact === TradeExact.OUTPUT && !!errors}
        caption="Receive"
      />

      <Box className={classes.additionalInfo}>
        {!rateForm.loading ?
          !errors ?
            <Typography variant="caption">
              <b>Rate:</b> {rate} {rateForm.values.outputCurrency}/{rateForm.values.inputCurrency}
              {feeAmount && <span><br/><b>Fees:</b> {feeAmount} {rateForm.values.fees.currency}</span>}
            </Typography>
            :
            errors.map(errorType =>
              <InvalidMessage key={errorType}>
                {errorType === 'lowBalance' && 'You do not have enough funds'}
                {errorType === 'lowAmount' && `Minimum amount is ${LOW_OUTPUT_AMOUNT} ${rateForm.values.outputCurrency}`}
                {errorType === 'highAmount' && `Maximum amount is ${HIGH_OUTPUT_AMOUNT} ${rateForm.values.outputCurrency}`}
              </InvalidMessage>
            )
          :
          <LoadingRing/>
        }
      </Box>
      {ethManager &&
      <Button mode="strong" onClick={submit} wide icon={buttonIcon} label={buttonLabel} disabled={!valid} />
      }
    </>
  );
}

export default RateForm;
