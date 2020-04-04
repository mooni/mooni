import React from 'react';
import styled from 'styled-components';

import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BN from 'bignumber.js';
import {Link, textStyle, Field, GU} from '@aragon/ui';

import { getCurrencyLogoAddress, SIGNIFICANT_DIGITS } from '../lib/currencies';

import bityLogo from '../assets/bity_logo_blue.svg';

const useStyles = makeStyles(theme => ({
  root: {
    paddingBottom: theme.spacing(1),
  },
  caption: {
    paddingLeft: 22,
    color: theme.palette.text.secondary,
  },
  rowRoot: {
    border: '1px solid black',
    borderWidth: '1px',
    paddingLeft: theme.spacing(2),
    borderColor: theme.palette.divider,
    paddingRight: theme.spacing(2),
    display: 'flex',
    borderRadius: 30,
    height: 48,
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    boxShadow: '1px 1px 7px rgba(47, 36, 36, 0.09)',
  },
  amountInput: {
    border: 'none',
    width: '100%',
    textAlign: 'start',
    height: 35,
    padding: theme.spacing(0, 1),
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.default,
    '&:focus': {
      outline: 'none',
    }
  },
  currencySelector: {
    width: 86,
  },
  recipientField: {
    marginBottom: 10,
  }
}));

const Title = styled.p`
  ${textStyle('title3')};
  text-align: center;
`;

const Value = styled.p`
  ${textStyle('body3')};
`;

const PoweredBy = styled.span`
  ${textStyle('label2')};
  margin-right: ${0.5 * GU}px;
`;

function RecipientRow({ label, value }) {
  const classes = useStyles();
  return (
    <Field label={label} className={classes.recipientField}>
      <Value data-private>{value}</Value>
    </Field>
  )
}

function AmountRow({ value, symbol, caption }) {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.caption}>
        <Typography variant="caption">
          {caption}
        </Typography>
      </Box>
      <Box className={classes.rowRoot}>
        <Box flex={1}>
          <input
            type="number"
            min={0}
            value={BN(value).sd(SIGNIFICANT_DIGITS).toString()}
            readOnly
            className={classes.amountInput}
          />
        </Box>
        <Box className={classes.currencySelector}>
          <Box display="flex" alignItems="center">
            <img
              src={getCurrencyLogoAddress(symbol)}
              alt={`coin-icon-${symbol}`}
              width={20}
            />
            <Box ml={1}>{symbol}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function PaymentOrderRecap({ paymentOrder }) {
  const recipient = paymentOrder.paymentRequest.recipient;

  let fullAddress = '';
  if(recipient.owner?.address) {
    fullAddress += recipient.owner.address;
  }
  if(recipient.owner?.zip) {
    fullAddress += ', ' + recipient.owner.zip;
  }
  if(recipient.owner?.city) {
    fullAddress += ', ' + recipient.owner.city;
  }
  if(recipient.owner?.country) {
    fullAddress += ', ' + recipient.owner.country;
  }

  const inputAmount = paymentOrder.path === 'DEX_BITY' ? paymentOrder.tokenRate.inputAmount : paymentOrder.bityOrder.input.amount;
  const inputCurrency = paymentOrder.path === 'DEX_BITY' ? paymentOrder.tokenRate.inputCurrency : paymentOrder.bityOrder.input.currency;

  const outputAmount = paymentOrder.bityOrder.output.amount;
  const outputCurrency = paymentOrder.bityOrder.output.currency;

  const rate = BN(outputAmount).div(inputAmount).sd(SIGNIFICANT_DIGITS).toString();

  let fees, feesCurrency;
  if(paymentOrder.bityOrder.fees.currency === paymentOrder.bityOrder.input.currency) {
    fees = BN(paymentOrder.bityOrder.fees.amount).times(outputAmount).div(inputAmount).sd(SIGNIFICANT_DIGITS).toString();
    feesCurrency = paymentOrder.bityOrder.output.currency;
  }  else {
    fees = BN(paymentOrder.bityOrder.fees.amount).sd(SIGNIFICANT_DIGITS).toString();
    feesCurrency = paymentOrder.bityOrder.fees.currency;
  }

  return (
    <Box>
      <Box px={1}>
        <RecipientRow label="Name" value={recipient.owner.name}/>
        {fullAddress && <RecipientRow label="Address" value={fullAddress}/>}

        <RecipientRow label="IBAN" value={recipient.iban}/>
        {recipient.bic_swift && <RecipientRow label="BIC" value={recipient.bic_swift}/>}
        {paymentOrder.paymentRequest.reference && <RecipientRow label="Reference" value={paymentOrder.paymentRequest.reference}/>}
        {paymentOrder.paymentRequest.contactPerson?.email && <RecipientRow label="Contact email" value={paymentOrder.paymentRequest.contactPerson?.email}/>}
      </Box>

      <AmountRow value={inputAmount} symbol={inputCurrency} caption="You send" />
      <AmountRow value={outputAmount} symbol={outputCurrency} caption="You receive" />

      <Box textAlign="center">
        <Typography variant="caption">
          <b>Rate:</b> ~{rate} {outputCurrency}/{inputCurrency}
        </Typography><br/>
        <Typography variant="caption">
          <b>Fees:</b> {fees} {feesCurrency}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
        <PoweredBy>Powered by </PoweredBy>
        <Link external href="https://bity.com"><img src={bityLogo} alt="bity" width={70} /></Link>
      </Box>
    </Box>
  )
}
