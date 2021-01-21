import React from 'react';
import styled from 'styled-components';

import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { textStyle, Field, Info, Timer } from '@aragon/ui';

import {truncateNumber} from '../../lib/numbers';

import {BityTrade, MultiTrade, TradeType} from "../../lib/trading/types";
import { RateAmount } from "./RateAmount";
import { CurrencyLogo } from './Currencies/CurrencyLogo';

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

const Value = styled.p`
  ${textStyle('body3')};
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
            value={truncateNumber(value)}
            readOnly
            className={classes.amountInput}
          />
        </Box>
        <Box className={classes.currencySelector}>
          <Box display="flex" alignItems="center">
            <CurrencyLogo symbol={symbol} width="20px"/>
            <Box ml={1}>{symbol}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function OrderRecap({ multiTrade }: { multiTrade: MultiTrade }) {
  const bankInfo = multiTrade.bankInfo;
  if(!bankInfo) throw new Error('missing bank info in OrderRecap');
  const {recipient, reference} = bankInfo;

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

  const inputAmount = multiTrade.inputAmount;
  const outputAmount = multiTrade.outputAmount;
  const inputCurrencySymbol = multiTrade.tradeRequest.inputCurrencySymbol;
  const outputCurrencySymbol = multiTrade.tradeRequest.outputCurrencySymbol;

  const bityTrade = multiTrade.trades.find(t => t.tradeType === TradeType.BITY) as BityTrade;
  const orderExpireDate = new Date(bityTrade.bityOrderResponse.timestamp_price_guaranteed);

  return (
    <Box>
      <Box px={1}>
        <RecipientRow label="Name" value={recipient.owner.name}/>
        {fullAddress && <RecipientRow label="Address" value={fullAddress}/>}

        <RecipientRow label="IBAN" value={recipient.iban}/>
        {recipient.bic_swift && <RecipientRow label="BIC" value={recipient.bic_swift}/>}
        {reference && <RecipientRow label="Reference" value={reference}/>}
        {recipient.email && <RecipientRow label="Contact email" value={recipient.email}/>}
        {multiTrade.referralId && <RecipientRow label="Referral ID" value={multiTrade.referralId}/>}
      </Box>

      <AmountRow value={inputAmount} symbol={inputCurrencySymbol} caption="You send" />
      <AmountRow value={outputAmount} symbol={outputCurrencySymbol} caption="You receive" />

      <Box display="flex" justifyContent="center">
        <RateAmount multiTradeEstimation={multiTrade}/>
      </Box>

      <Box pt={1}>
        <Info title="Price guaranteed for" mode="warning">
          <Timer end={orderExpireDate} />
        </Info>
      </Box>
    </Box>
  )
}
