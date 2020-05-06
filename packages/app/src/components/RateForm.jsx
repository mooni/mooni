import React, { useState, useEffect } from 'react';
import BN from 'bignumber.js';

import { Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { LoadingRing, textStyle } from '@aragon/ui'
import styled from 'styled-components';

import AmountRow from './AmountRow';

import { useDebounce } from '../lib/hooks';
import { getRate } from '../lib/exchange';
import { isNotZero } from '../lib/numbers';
import { TradeExact } from '../lib/types';
import { logError } from '../lib/log';

import {
  INPUT_CURRENCIES as inputCurrencies,
  OUTPUT_CURRENCIES as outputCurrencies,
  SIGNIFICANT_DIGITS,
} from '../lib/currencies';

const InvalidMessage = styled.p`
  ${textStyle('body4')};
  color: #e61b1b;
`;

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
  },
  additionalInfo: {
    height: 46,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
  },
}));

function RateForm({ onChange = () => null, onValid = () => null, defaultRateRequest }) {
  const classes = useStyles();

  const [rateDetails, setRateDetails] = useState({
    inputCurrencyId: 0,
    inputCurrency: inputCurrencies[0],
    outputCurrencyId: 0,
    outputCurrency: outputCurrencies[0],
    inputAmount: null,
    outputAmount: 100,
    tradeExact: TradeExact.OUTPUT,
  });
  const [rateLoading, setRateLoading] = useState(false);
  const [valid, setValid] = useState(true);
  const [rateRequest, setRateRequest] = useState(null);
  const [fees, setFees] = useState(null);
  const debouncedRateRequest = useDebounce(rateRequest, 1000);

  useEffect(() => {
    if(defaultRateRequest) {
      const newRateDetails = {
        inputCurrencyId: inputCurrencies.indexOf(defaultRateRequest.inputCurrency),
        inputCurrency: defaultRateRequest.inputCurrency,
        outputCurrencyId: outputCurrencies.indexOf(defaultRateRequest.outputCurrency),
        outputCurrency: defaultRateRequest.outputCurrency,
        inputAmount: defaultRateRequest.tradeExact === TradeExact.INPUT ? defaultRateRequest.amount : null,
        outputAmount: defaultRateRequest.tradeExact === TradeExact.OUTPUT ? defaultRateRequest.amount : null,
        tradeExact: defaultRateRequest.tradeExact,
      };
      setRateDetails(newRateDetails);
      setRateRequest({
        inputCurrency: defaultRateRequest.inputCurrency,
        outputCurrency: defaultRateRequest.outputCurrency,
        amount: defaultRateRequest.amount,
        tradeExact: defaultRateRequest.tradeExact,
      });
    } else {
      setRateRequest({
        inputCurrency: rateDetails.inputCurrency,
        outputCurrency: rateDetails.outputCurrency,
        amount: rateDetails.tradeExact === TradeExact.INPUT ? rateDetails.inputAmount : rateDetails.outputAmount,
        tradeExact: rateDetails.tradeExact,
      });
    }
    setRateLoading(true);
  }, [defaultRateRequest]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onChange(rateRequest);
    setValid(rateRequest && isNotZero(rateRequest.amount));
  }, [onChange, rateRequest]);

  useEffect(() => {
    onValid(valid);
  }, [valid, onValid]);

  useEffect(() => {
    let isMounted = true;
    if (!debouncedRateRequest || !isNotZero(debouncedRateRequest.amount)) return;

    (async () => {

      setRateLoading(true);

      const res = await getRate(debouncedRateRequest);

      if(!isMounted) return;

      const updateRateDetails = {};
      if(debouncedRateRequest.tradeExact === TradeExact.INPUT)
        updateRateDetails.outputAmount = BN(res.outputAmount).toFixed();
      if(debouncedRateRequest.tradeExact === TradeExact.OUTPUT)
        updateRateDetails.inputAmount = BN(res.inputAmount).toFixed();

      setRateDetails(r => ({
        ...r,
        ...updateRateDetails,
      }));

      setFees(res.fees);

      setRateLoading(false);

    })().catch(error => logError('unable to fetch rates', error));

    return () => isMounted = false;
  }, [debouncedRateRequest]);

  function onChangeInputCurrency(inputCurrencyId) {
    setRateLoading(true);
    const inputCurrency = inputCurrencies[inputCurrencyId];
    setRateDetails({
      ...rateDetails,
      inputCurrency,
      inputCurrencyId,
    });
    setRateRequest({
      ...rateRequest,
      inputCurrency,
    });
  }
  function onChangeOutputCurrency(outputCurrencyId) {
    setRateLoading(true);
    const outputCurrency = outputCurrencies[outputCurrencyId];
    setRateDetails({
      ...rateDetails,
      outputCurrency,
      outputCurrencyId,
    });
    setRateRequest({
      ...rateRequest,
      outputCurrency,
    });
  }

  const onChangeValue = tradeExact => e => {
    setRateLoading(true);
    const amount = e.target.value;
    if(Number(amount) < 0) return;

    const newRateDetails = {
      ...rateDetails,
      inputAmount: tradeExact === TradeExact.INPUT ? amount : null,
      outputAmount: tradeExact === TradeExact.OUTPUT ? amount : null,
      tradeExact,
    };
    setRateDetails(newRateDetails);
    setRateRequest({
      ...rateRequest,
      tradeExact,
      amount,
    });
  }

  let rate, feeAmount;
  if(rateDetails) {
    rate = new BN(rateDetails.outputAmount).div(rateDetails.inputAmount).sd(SIGNIFICANT_DIGITS).toFixed();
  }

  if(fees) {
    if(outputCurrencies.includes(fees.currency)) {
      feeAmount = new BN(fees.amount).dp(2).toFixed();
    } else {
      feeAmount = new BN(fees.amount).sd(SIGNIFICANT_DIGITS).toFixed();
    }
  }

  return (
    <Box py={1}>
      <AmountRow
        value={rateDetails.inputAmount}
        currencyId={rateDetails.inputCurrencyId}
        onChangeValue={onChangeValue(TradeExact.INPUT)}
        onChangeCurrency={onChangeInputCurrency}
        currencies={inputCurrencies}
        active={rateDetails.tradeExact === TradeExact.INPUT}
        caption="Send"
      />
      <AmountRow
        value={rateDetails.outputAmount}
        currencyId={rateDetails.outputCurrencyId}
        onChangeValue={onChangeValue(TradeExact.OUTPUT)}
        onChangeCurrency={onChangeOutputCurrency}
        currencies={outputCurrencies}
        active={rateDetails.tradeExact === TradeExact.OUTPUT}
        caption="Receive"
      />

      <Box className={classes.additionalInfo}>
        {valid ?
          rateLoading ?
            <LoadingRing/>
            :
            <Typography variant="caption">
              <b>Rate:</b> {rate} {rateDetails.outputCurrency}/{rateDetails.inputCurrency}
              {fees && <span><br/><b>Fees:</b> {feeAmount} {fees.currency}</span>}
            </Typography>
          :
          <InvalidMessage>Invalid amount</InvalidMessage>
        }
      </Box>
    </Box>
  );
}

export default RateForm;
