import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import BN from 'bignumber.js';

import { Hidden, Paper, Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ShuffleIcon from '@material-ui/icons/Shuffle';

import { DropDown, TextInput, Info, LoadingRing } from '@aragon/ui'

import Bity from '../lib/bity';

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

function SimpleFiatForm() {
  const classes = useStyles();

  const [rateLoading, setRateLoading] = useState(true);
  const [inputCurrency, setInputCurrency] = useState(0);
  const [outputCurrency, setOutputCurrency] = useState(0);
  const [inputAmount, setInputAmount] = useState('-');
  const [outputAmount, setOutputAmount] = useState(100);
  const [rate, setRate] = useState(null);

  const estimateInput = useCallback(async outputValue => {
    setRate(null);
    setInputAmount('');
    setRateLoading(true);
    const res = await Bity.estimate({
      inputCurrency: inputCurrencies[inputCurrency],
      outputCurrency: outputCurrencies[outputCurrency],
      outputAmount: outputValue,
    });
    setInputAmount(String(res.inputAmount).substring(0,10));
    setRateLoading(false);
    const rate = BN(outputValue).div(res.inputAmount).dp(3).toString();
    setRate(rate);
  }, [inputCurrency, outputCurrency]);

  const throttledEstimateInput = useMemo(() => debounce(estimateInput, 1000), [estimateInput]);

  useEffect(() => {
    if(inputCurrency !== null && outputCurrency !== null && outputAmount !== null) {
      throttledEstimateInput(outputAmount);
      return throttledEstimateInput.cancel;
    }
  }, [inputCurrency, outputCurrency, outputAmount]);

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
                  value={inputAmount}
                  wide
                  className={classes.amountInput}
                  readOnly
                  disabled
                  adornment={<Box>You send</Box>}
                  adornmentSettings={{ width: 50 }}
                />
              </Grid>
              <Grid item xs={4}>
                <DropDown
                  items={inputCurrencies}
                  selected={inputCurrency}
                  onChange={setInputCurrency}
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
                  value={outputAmount}
                  onChange={e => setOutputAmount(Number(e.target.value))}
                  wide
                  className={classes.amountInput}
                  adornment={<Box>You get</Box>}
                  adornmentSettings={{ width: 50 }}
                />
              </Grid>
              <Grid item xs={4}>
                <DropDown
                  items={outputCurrencies}
                  selected={outputCurrency}
                  onChange={setOutputCurrency}
                  wide
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Box py={2} width={200} mx="auto">
        <Info title="Estimated exchange rate">
            <Box>~{rate || '-'} {outputCurrencies[outputCurrency]}/{inputCurrencies[inputCurrency]}</Box>
        </Info>
      </Box>
    </Box>
  );
}

export default SimpleFiatForm;
