import React, { useState } from 'react';
import useForm from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';

import { Box, Paper, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { Button, Field, DropDown, IconArrowLeft, IconArrowRight } from '@aragon/ui'
import { WideInput, FieldError } from './StyledComponents';

import { setPaymentDetail } from '../redux/payment/actions';
import { getPaymentDetail } from '../redux/payment/selectors';

import { OUTPUT_CURRENCIES } from '../lib/currencies';

const useStyles = makeStyles(theme => ({
  formRow: {
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
    padding: 6,
  },
  exchangeIcon: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

function StepPaymentDetail({ onComplete, onBack }) {
  const classes = useStyles();

  const paymentDetails = useSelector(getPaymentDetail);
  const dispatch = useDispatch();

  const [selectedCurrency, setSelectedCurrency] = useState(Math.max(OUTPUT_CURRENCIES.indexOf(paymentDetails.outputCurrency), 0));

  const { register, handleSubmit, errors } = useForm({
    mode: 'onChange',
    defaultValues: paymentDetails ? {
      amount: paymentDetails.outputAmount ?? 100,
      reference: paymentDetails.reference ?? '',
    } : {
      amount: 100,
      reference: '',
    },
  });

  const onSubmit = handleSubmit(async data => {
    dispatch(setPaymentDetail({
      outputAmount: data.amount,
      outputCurrency: OUTPUT_CURRENCIES[selectedCurrency],
      reference: data.reference,
    }));

    onComplete();
  });

  const fields = {
    amount: {
      required: true,
      min: 0,
      pattern: /^[0-9]+\.?[0-9]*$/,
      validate: value => Number(value) > 0,
    },
    reference: {
      pattern: /^[0-9A-Za-z ]*$/,
    },
  };

  const hasErrors = Object.keys(errors).length !== 0;

  return (
    <Box width={1}>
      <form onSubmit={onSubmit}>
        <Paper className={classes.formRow}>
          <Grid container spacing={0}>
            <Grid item xs={8}>
              <Box display="flex" flexDirection="row">
                <Box className={classes.amountLabel}>
                  Amount
                </Box>
                <WideInput
                  type="number"
                  name="amount"
                  min={0}
                  ref={register(fields.amount)}
                  className={classes.amountInput}
                  adornment={<Box>Amount</Box>}
                  adornmentSettings={{ width: 50 }}
                  placeholder="10"
                />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <DropDown
                items={OUTPUT_CURRENCIES}
                selected={selectedCurrency}
                onChange={setSelectedCurrency}
                wide
              />
            </Grid>
          </Grid>
          {errors.amount && <FieldError>Invalid amount</FieldError>}
        </Paper>
        <Box py={2}>
          <Field label="Reference (optional)">
            <WideInput
              name="reference"
              ref={register(fields.reference)}
              placeholder="Bill A2313"
            />
            {errors.reference && <FieldError>Invalid reference, please only use regular letters and numbers</FieldError>}
          </Field>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button mode="normal" onClick={onBack} wide icon={<IconArrowLeft/>} label="Go back" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button mode="strong" onClick={onSubmit} wide icon={<IconArrowRight/>} label="Save amount" disabled={hasErrors} />
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default StepPaymentDetail;
