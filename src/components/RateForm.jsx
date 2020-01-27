import React, { useState, useEffect } from 'react';
import BN from 'bignumber.js';

import { Hidden, Paper, Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ShuffleIcon from '@material-ui/icons/Shuffle';

import { DropDown, TextInput, Info, LoadingRing } from '@aragon/ui'
import { FieldError } from './StyledComponents';

import { useDebounce } from '../lib/hooks';
import { getRate } from '../lib/exchange';

import {
  INPUT_CURRENCIES as inputCurrencies,
  OUTPUT_CURRENCIES as outputCurrencies,
} from '../lib/currencies';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
  },
  formRow: {
    padding: theme.spacing(1, 1),
  },
  form: {
    padding: theme.spacing(1, 1),
  },
  amountInput: {
    textAlign: 'right',
    border: 'none',
    width: '100%',
  },
  amountLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  exchangeIcon: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

function RateForm({ onChange, invalid, defaultRateRequest }) {
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
  const [rateRequest, setRateRequest] = useState(null);

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

  const debouncedRateRequest = useDebounce(rateRequest, 1000);
  const [rateLoading, setRateLoading] = useState(true);
  const rate = (rateLoading) ? null : BN(rateDetails.outputAmount).div(rateDetails.inputAmount).dp(3).toString();

  useEffect(() => {
    onChange(rateRequest);
  }, [onChange, rateRequest]);

  useEffect(() => {
    let isMounted = true;

    (async () => {

      if (!debouncedRateRequest || debouncedRateRequest.amount === 0) return;

      setRateLoading(true);

      const res = await getRate(debouncedRateRequest);

      if(!isMounted) return;

      setRateDetails(r => ({
        ...r,
        inputAmount: res.inputAmount,
        outputAmount: res.outputAmount,
      }));

      setRateLoading(false);
    })();

    return () => isMounted = false;
  }, [debouncedRateRequest]);

  function onChangeInputCurrency(currencyId) {
    setRateLoading(true);
    const newRateDetails = {
      ...rateDetails,
      inputCurrency: inputCurrencies[currencyId],
      inputCurrencyId: currencyId,
    };
    setRateDetails(newRateDetails);
    setRateRequest({
      ...rateRequest,
      inputCurrency: newRateDetails.inputCurrency,
    });
  }
  function onChangeOutputCurrency(currencyId) {
    setRateLoading(true);
    const newRateDetails = {
      ...rateDetails,
      outputCurrency: outputCurrencies[currencyId],
      outputCurrencyId: currencyId,
    };
    setRateDetails(newRateDetails);
    setRateRequest({
      ...rateRequest,
      outputCurrency: newRateDetails.outputCurrency,
    });
  }
  /*
  function onChangeInputValue(e) {
    setRateLoading(true);
    const value = Number(e.target.value);
    const newRateDetails = {
      ...rateDetails,
      inputAmount: value,
      outputAmount: null,
      tradeExact: 'INPUT',
    };
    setRateDetails(newRateDetails);
    setRateRequest({
      ...rateRequest,
      amount: newRateDetails.inputAmount,
      tradeExact: newRateDetails.tradeExact,
    });
  }
  */

  function onChangeOutputValue(e) {
    setRateLoading(true);
    const value = Number(e.target.value);
    const newRateDetails = {
      ...rateDetails,
      inputAmount: null,
      outputAmount: value,
      tradeExact: 'OUTPUT',
    };
    setRateDetails(newRateDetails);
    setRateRequest({
      ...rateRequest,
      amount: newRateDetails.outputAmount,
      tradeExact: newRateDetails.tradeExact,
    });
  }

  return (
    <Box className={classes.root}>
      <Grid container spacing={1} className={classes.form}>
        <Grid item xs={12} sm>
          <Paper className={classes.formRow}>
            <Grid container spacing={0}>
              <Grid item xs={8}>
                <TextInput
                  type="number"
                  min={0}
                  value={BN(rateDetails.inputAmount ?? 0).dp(3).toString()}
                  disabled
                  readOnly
                  wide
                  adornment={<Box>You send</Box>}
                  className={classes.amountInput}
                  adornmentSettings={{ width: 50 }}
                />
              </Grid>
              <Grid item xs={4}>
                <DropDown
                  items={inputCurrencies}
                  selected={rateDetails.inputCurrencyId}
                  onChange={onChangeInputCurrency}
                  wide
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Hidden smDown>
          <Grid item sm={1} className={classes.exchangeIcon}>
            {(rateLoading) ?
              <LoadingRing size={24} />
              :
              <ShuffleIcon/>
            }
          </Grid>
        </Hidden>
        <Grid item xs={12} sm>
          <Paper className={classes.formRow}>
            <Grid container spacing={0}>
              <Grid item xs={8}>
                <TextInput
                  type="number"
                  min={0}
                  value={BN(rateDetails.outputAmount ?? 0).dp(3).toString()}
                  onChange={onChangeOutputValue}
                  wide
                  className={classes.amountInput}
                  adornment={<Box>You get</Box>}
                  adornmentSettings={{ width: 50 }}
                />
              </Grid>
              <Grid item xs={4}>
                <DropDown
                  items={outputCurrencies}
                  selected={rateDetails.outputCurrencyId}
                  onChange={onChangeOutputCurrency}
                  wide
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Box py={2} height={111} mx="auto">
        <Info title="Estimated exchange rate">
          {invalid &&
          <Box display="flex" justifyContent="center">
            <FieldError>Invalid amount</FieldError>
          </Box>
          }
          {!invalid && rate &&
          <Box textAlign="center" width={1}>~{rate} {rateDetails.outputCurrency}/{rateDetails.inputCurrency}</Box>
          }
          {!invalid && !rate &&
          <Box display="flex" justifyContent="center"><LoadingRing size={12} /></Box>
          }
        </Info>
      </Box>
    </Box>
  );
}

export default RateForm;
