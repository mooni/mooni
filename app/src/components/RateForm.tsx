import React from 'react';
import BN from 'bignumber.js';

import { Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import { LoadingRing, textStyle, Button, IconRefresh } from '@aragon/ui'
import styled from 'styled-components';

import AmountRow from './AmountRow';

import { TradeExact } from '../lib/trading/types';

import { getInputCurrencies } from '../redux/ui/selectors';

import { getCurrenciesSymbols } from '../lib/trading/currencyHelpers';
import { SIGNIFICANT_DIGITS } from '../lib/numbers';
import { useRate } from '../hooks/rates';
import { getETHManager, getETHManagerLoading } from '../redux/eth/selectors';
import {TradeRequest} from "../lib/trading/types";
import {CurrencyType} from "../lib/trading/currencyTypes";

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

const outputCurrencies: string[] = getCurrenciesSymbols(CurrencyType.FIAT);

interface RateFormParams {
 onSubmit: (TradeRequest?) => void;
  initialTradeRequest: TradeRequest;
  buttonLabel?: string,
  buttonIcon?: any,
}

function RateForm({ onSubmit = () => null, initialTradeRequest, buttonLabel = 'Exchange', buttonIcon = <IconRefresh /> }: RateFormParams) {
  const classes = useStyles();
  const inputCurrencies = useSelector(getInputCurrencies);
  const ethManager = useSelector(getETHManager);
  const ethManagerLoading = useSelector(getETHManagerLoading);
  const { rateForm, tradeRequest, onChangeAmount, onChangeCurrency, HIGH_OUTPUT_AMOUNT } = useRate(initialTradeRequest);

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
  const errors = rateForm.errors;

  function submit() {
    if(!valid) return;
    onSubmit(tradeRequest);
  }

  return (
    <>
      <AmountRow
        value={rateForm.values.inputAmount}
        currencies={inputCurrencies}
        selectedSymbol={rateForm.values.inputCurrency}
        onChangeCurrency={onChangeCurrency(TradeExact.INPUT)}
        onChangeValue={onChangeAmount(TradeExact.INPUT)}
        active={rateForm.values.tradeExact === TradeExact.INPUT}
        currencyDisabled={rateForm.values.tradeExact === TradeExact.OUTPUT && rateForm.loading}
        valueDisabled={rateForm.values.tradeExact === TradeExact.OUTPUT && rateForm.loading}
        error={!rateForm.loading && rateForm.values.tradeExact === TradeExact.INPUT && !!errors}
        caption="Send"
      />
      <AmountRow
        value={rateForm.values.outputAmount}
        currencies={outputCurrencies}
        selectedSymbol={rateForm.values.outputCurrency}
        onChangeCurrency={onChangeCurrency(TradeExact.OUTPUT)}
        onChangeValue={onChangeAmount(TradeExact.OUTPUT)}
        active={rateForm.values.tradeExact === TradeExact.OUTPUT}
        currencyDisabled={rateForm.values.tradeExact === TradeExact.INPUT && rateForm.loading}
        valueDisabled={rateForm.values.tradeExact === TradeExact.INPUT && rateForm.loading}
        error={!rateForm.loading && rateForm.values.tradeExact === TradeExact.OUTPUT && !!errors}
        caption="Receive"
      />

      <Box className={classes.additionalInfo}>
        {!rateForm.loading ?
          !errors ?
            <Typography variant="caption">
              <b>Rate:</b> {rate} {rateForm.values.outputCurrency}/{rateForm.values.inputCurrency}
              {feeAmount && <span><br/><b>Fees:</b> {feeAmount} {rateForm.values.fees?.currency}</span>}
            </Typography>
            :
            Object.entries(errors).map(([key, value]) =>
              <InvalidMessage key={key}>
                {key === 'lowBalance' && 'You do not have enough funds'}
                {key === 'lowAmount' && `Minimum amount is ${errors[key]} ${rateForm.values.outputCurrency}`}
                {key === 'highAmount' && `Maximum amount is ${HIGH_OUTPUT_AMOUNT} ${rateForm.values.outputCurrency}`}
                {key === 'zeroAmount' && `Amount can't be zero`}
              </InvalidMessage>
            )
          :
          <LoadingRing/>
        }
      </Box>
      {(ethManager && !ethManagerLoading) &&
      <Button mode="strong" onClick={submit} wide icon={buttonIcon} label={buttonLabel} disabled={!valid} />
      }
    </>
  );
}

export default RateForm;
