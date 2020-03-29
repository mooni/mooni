import React, { useState, useEffect } from 'react';
import BN from 'bignumber.js';

import { Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { LoadingRing } from '@aragon/ui'
import AmountRow from './AmountRow';

import { useDebounce } from '../lib/hooks';
import { getRate } from '../lib/exchange';

import {
  INPUT_CURRENCIES as inputCurrencies,
  OUTPUT_CURRENCIES as outputCurrencies,
  SIGNIFICANT_DIGITS,
  // ENABLE_TOKENS,
} from '../lib/currencies';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
  },
  interRow: {
    height: 46,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
  },
}));

function RateForm({ onChange, defaultRateRequest }) {
  const classes = useStyles();

  const [rateDetails, setRateDetails] = useState({
    inputCurrencyId: 0,
    inputCurrency: inputCurrencies[0],
    outputCurrencyId: 0,
    outputCurrency: outputCurrencies[0],
    inputAmount: null,
    outputAmount: 100,
    tradeExact: 'OUTPUT',
  });
  const [rateLoading, setRateLoading] = useState(true);
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
        inputAmount: defaultRateRequest.tradeExact === 'INPUT' ? defaultRateRequest.amount : null,
        outputAmount: defaultRateRequest.tradeExact === 'OUTPUT' ? defaultRateRequest.amount : null,
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
        amount: rateDetails.tradeExact === 'INPUT' ? rateDetails.inputAmount : rateDetails.outputAmount,
        tradeExact: rateDetails.tradeExact,
      });
    }
  }, [defaultRateRequest]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onChange(rateRequest);
  }, [onChange, rateRequest]);

  useEffect(() => {
    let isMounted = true;
    if (!debouncedRateRequest || debouncedRateRequest.amount === 0) return;

    (async () => {

      setRateLoading(true);

      const res = await getRate(debouncedRateRequest);

      if(!isMounted) return;

      const updateRateDetails = {};
      if(debouncedRateRequest.tradeExact === 'INPUT')
        updateRateDetails.outputAmount = BN(res.outputAmount).toString();
      if(debouncedRateRequest.tradeExact === 'OUTPUT')
        updateRateDetails.inputAmount = BN(res.inputAmount).toString();

      setRateDetails(r => ({
        ...r,
        ...updateRateDetails,
      }));

      setFees(res.fees);

      setRateLoading(false);

    })().catch(console.error);

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
    const amount = Number(e.target.value);
    const newRateDetails = {
      ...rateDetails,
      inputAmount: tradeExact === 'INPUT' && amount,
      outputAmount: tradeExact === 'OUTPUT' && amount,
      tradeExact,
    };
    setRateDetails(newRateDetails);
    setRateRequest({
      ...rateRequest,
      tradeExact,
      amount,
    });
  }

  let feeValue, feeCurrency, rate;
  if(!rateLoading) {
    if(fees.currency === rateDetails.inputCurrency) {
      feeValue = BN(fees.amount).times(rateDetails.outputAmount).div(rateDetails.inputAmount).sd(SIGNIFICANT_DIGITS).toString();
      feeCurrency = rateDetails.outputCurrency;
    } else {
      feeValue = BN(fees.amount).sd(SIGNIFICANT_DIGITS).toString();
      feeCurrency = fees.currency;
    }
    rate = BN(rateDetails.outputAmount).div(rateDetails.inputAmount).sd(SIGNIFICANT_DIGITS).toString();
  }

  return (
    <Box py={1}>
      <AmountRow
        value={rateDetails.inputAmount}
        currencyId={rateDetails.inputCurrencyId}
        onChangeValue={onChangeValue('INPUT')}
        onChangeCurrency={onChangeInputCurrency}
        currencies={inputCurrencies}
        active={rateDetails.tradeExact === 'INPUT'}
        caption="Send"
      />
      <AmountRow
        value={rateDetails.outputAmount}
        currencyId={rateDetails.outputCurrencyId}
        onChangeValue={onChangeValue('OUTPUT')}
        onChangeCurrency={onChangeOutputCurrency}
        currencies={outputCurrencies}
        active={rateDetails.tradeExact === 'OUTPUT'}
        caption="Receive"
      />

      <Box className={classes.interRow}>
        {rate ?
          <Typography variant="caption">
            <b>Rate:</b> {rate} {rateDetails.outputCurrency}/{rateDetails.inputCurrency}
            <br/>
            <b>Fees:</b> {feeValue} {feeCurrency}
          </Typography>
          :
          <LoadingRing/>
        }
      </Box>
    </Box>
  );
}

export default RateForm;
