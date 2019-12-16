import React, { useState, useEffect } from 'react';
import BN from 'bignumber.js';

import { Hidden, Paper, Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ShuffleIcon from '@material-ui/icons/Shuffle';

import { DropDown, TextInput, Info, LoadingRing } from '@aragon/ui'

import Bity from '../lib/bity';
import { useDebounce } from '../lib/hooks';

import {
  INPUT_CURRENCIES as inputCurrencies,
  OUTPUT_CURRENCIES as outputCurrencies,
} from '../lib/currencies';

// TODO
// import { getPaymentDetail } from '../redux/payment/selectors';
// import { useSelector } from 'react-redux';

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

function RateForm({ onChange }) {
  const classes = useStyles();

  const [rateDetails, setRateDetails] = useState({
    inputCurrencyId: 0,
    inputCurrency: inputCurrencies[0],
    outputCurrencyId: 0,
    outputCurrency: outputCurrencies[0], // Math.max(outputCurrencies.indexOf(paymentDetails.outputCurrency), 0)
    inputAmount: null,
    outputAmount: 100, // paymentDetails.outputAmount ?? 100
    rateDirection: 'output',
  });

  const [rateRequest, setRateRequest] = useState(rateDetails);
  const debouncedRateRequest = useDebounce(rateRequest, 1000);

  const [rateLoading, setRateLoading] = useState(true);

  const rate = (rateLoading || rateRequest) ? null : BN(rateDetails.outputAmount).div(rateDetails.inputAmount).dp(3).toString();

  useEffect(() => {
    onChange(rateDetails);
  }, [onChange, rateDetails]);

  useEffect(() => {
    (async () => {
      if (!debouncedRateRequest) return;

      setRateLoading(true);

      const req = {
        inputCurrency: debouncedRateRequest.inputCurrency,
        outputCurrency: debouncedRateRequest.outputCurrency,
      };
      if(debouncedRateRequest.rateDirection === 'input') {
        req.inputAmount = debouncedRateRequest.inputAmount;
      }
      if(debouncedRateRequest.rateDirection === 'output') {
        req.outputAmount = debouncedRateRequest.outputAmount;
      }
      const res = await Bity.estimate(req);

      setRateDetails({
        ...debouncedRateRequest,
        inputAmount:  BN(res.inputAmount).dp(3).toString(),
        outputAmount: BN(res.outputAmount).dp(3).toString(),
      });

      setRateRequest(null);
      setRateLoading(false);
    })();
  }, [debouncedRateRequest]);

  function onChangeInputCurrency(currencyId) {
    const newRateDetails = {
      ...rateDetails,
      inputCurrency: inputCurrencies[currencyId],
      inputCurrencyId: currencyId,
    };
    setRateDetails(newRateDetails);
    setRateRequest(newRateDetails);
  }
  function onChangeOutputCurrency(currencyId) {
    const newRateDetails = {
      ...rateDetails,
      outputCurrency: outputCurrencies[currencyId],
      outputCurrencyId: currencyId,
    };
    setRateDetails(newRateDetails);
    setRateRequest(newRateDetails);
  }
  function onChangeInputValue(e) {
    const value = Number(e.target.value);
    const newRateDetails = {
      ...rateDetails,
      inputAmount: value,
      outputAmount: null,
      rateDirection: 'input',
    };
    setRateDetails(newRateDetails);
    setRateRequest(newRateDetails);
  }

  function onChangeOutputValue(e) {
    const value = Number(e.target.value);
    const newRateDetails = {
      ...rateDetails,
      inputAmount: null,
      outputAmount: value,
      rateDirection: 'output',
    };
    setRateDetails(newRateDetails);
    setRateRequest(newRateDetails);
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
                  value={String(rateDetails.inputAmount ?? '-')}
                  wide
                  adornment={<Box>You send</Box>}
                  className={classes.amountInput}
                  onChange={onChangeInputValue}
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
            {rateLoading ?
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
                  value={String(rateDetails.outputAmount ?? '-')}
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
      <Box py={2} width={200} height={111} mx="auto">
        {rate &&
        <Info title="Estimated exchange rate">
          <Box>~{rate || '-'} {rateDetails.outputCurrency}/{rateDetails.inputCurrency}</Box>
        </Info>
        }
      </Box>
    </Box>
  );
}

export default RateForm;
