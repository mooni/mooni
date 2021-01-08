import React, { Suspense } from 'react';
import BN from 'bignumber.js';
import {useImage} from 'react-image';
import { Box, Typography} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import { DropDown } from '@aragon/ui'

import { getCurrency, getCurrencyLogoAddress } from '../lib/trading/currencyHelpers';
import { SIGNIFICANT_DIGITS } from '../lib/numbers';
import tokenDefaultImage  from '../assets/token_default.png';

const useStyles = makeStyles(theme => ({
  caption: {
    paddingLeft: 22,
    color: theme.palette.text.secondary,
  },
  rowRoot: {
    border: '1px solid black',
    borderWidth: '1px',
    paddingLeft: theme.spacing(2),
    borderColor: '#e3f1f3',
    paddingRight: theme.spacing(2),
    display: 'flex',
    borderRadius: 30,
    height: 62,
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '1px 1px 7px rgba(73, 177, 189, 0.16)',
  },
  activeRow: {
    borderColor: '#9edbe4',
  },
  errorRow: {
    borderColor: '#e3a79f',
  },
  disabledRow: {
    backgroundColor: theme.palette.background.default,
  },
  amountInput: {
    border: 'none',
    width: '100%',
    textAlign: 'start',
    height: 35,
    padding: theme.spacing(0, 1),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '&:focus': {
      outline: 'none',
    }
  },
  currencySelector: {
    width: 126,
  },
  currencyButton: {
    borderRadius: 20,
    borderColor: '#aecfd6',
  },
  disabledInput: {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.default,
  },
}));

function CurrencyLogo({symbol}) {
  const currency = getCurrency(symbol);
  const {src} = useImage({
    srcList: [
      currency.img,
      getCurrencyLogoAddress(symbol),
      tokenDefaultImage,
    ],
  });

  return (
      <img
        src={src}
        alt={`coin-icon-${symbol}`}
        width={20}
      />
  );
}
function CurrencyItem({ symbol }) {
  return (
    <Box display="flex" alignItems="center">
      <Suspense
        fallback={
          <img
            src={tokenDefaultImage}
            alt={`coin-icon-${symbol}`}
            width={20}
          />
        }
      >
        <CurrencyLogo symbol={symbol}/>
      </Suspense>
      <Box ml={1}>{symbol}</Box>
    </Box>
  );
}

const Container = styled.div`
& + & {
  margin-top: 10px;
}
`;

export default function AmountRow({ value, selectedSymbol, onChangeValue, onChangeCurrency, currencies, active, error, valueDisabled, currencyDisabled, caption }) {
  const classes = useStyles();

  const displayedValue = value !== null ?
    (active ? value : BN(value).sd(SIGNIFICANT_DIGITS).toFixed())
    : '';

  return (
    <Container>
      <Box className={classes.caption}>
        <Typography variant="caption">
          {caption}
        </Typography>
      </Box>
      <Box className={[classes.rowRoot, valueDisabled && classes.disabledRow, active && classes.activeRow, error && classes.errorRow].join(' ')}>
        <Box flex={1}>
          <input
            type="number"
            className={[classes.amountInput, valueDisabled && classes.disabledInput].join(' ')}
            value={displayedValue}
            onChange={onChangeValue}
            readOnly={valueDisabled}
            min={0}
          />
        </Box>
        <Box className={classes.currencySelector}>
          <DropDown
            items={currencies.map(symbol => <CurrencyItem symbol={symbol}/>)}
            selected={currencies.indexOf(selectedSymbol)}
            onChange={i => onChangeCurrency(currencies[i])}
            disabled={currencyDisabled}
            className={classes.currencyButton}
            wide
          />
        </Box>
      </Box>
    </Container>
  );
}
