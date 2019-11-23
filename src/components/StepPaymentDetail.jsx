import React, { useState } from 'react';
import useForm from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';

import { Box, Paper, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { Button, Field, DropDown, TextInput, IconArrowLeft, IconArrowRight } from '@aragon/ui'
import { WideInput } from './StyledComponents';

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
  },
  exchangeIcon: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

function StepPaymentDetail({ onComplete, onBackRecipient }) {
  const classes = useStyles();

  const paymentDetails = useSelector(getPaymentDetail);
  const dispatch = useDispatch();

  const [outputAmount, setOutputAmount] = useState(paymentDetails.outputAmount);
  const [selectedCurrency, setSelectedCurrency] = useState(OUTPUT_CURRENCIES.indexOf(paymentDetails.outputCurrency));

  const { register, handleSubmit, errors } = useForm();

  const onSubmit = handleSubmit(async data => {
    dispatch(setPaymentDetail({
      outputAmount,
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
      pattern: /[0-9A-Za-z ]*/,
    },
  };

  return (
    <Box width={1}>
      <form onSubmit={onSubmit}>
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
                adornment={<Box>Amount</Box>}
                adornmentSettings={{ width: 50 }}
              />
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
        </Paper>
        <Box py={2}>
          <Field label="Reference">
            <WideInput name="reference" ref={register(fields.reference)} defaultValue={paymentDetails.reference} />
            {errors.reference && <Box>Invalid reference, please only use regular letters and numbers</Box>}
          </Field>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button mode="normal" onClick={onBackRecipient} wide icon={<IconArrowLeft/>} label="Edit recipient" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button mode="strong" onClick={onSubmit} wide icon={<IconArrowRight/>} label="Save amount" />
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default StepPaymentDetail;
