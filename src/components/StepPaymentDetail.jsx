import React, { useState } from 'react';
import useForm from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';

import { Box, Paper, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { Button, Field, DropDown, TextInput } from '@aragon/ui'
import { GroupLabel } from './StyledComponents';

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

function StepPaymentDetail({ onComplete }) {
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
        <GroupLabel>Payment details</GroupLabel>
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
            <input name="reference" ref={register(fields.reference)} defaultValue={paymentDetails.reference} />
            {errors.reference && <Box>Invalid reference, please only use regular letters and numbers</Box>}
          </Field>
        </Box>
        <Button mode="strong" onClick={onSubmit} wide>Save amount</Button>
      </form>
    </Box>
  )
}

export default StepPaymentDetail;
