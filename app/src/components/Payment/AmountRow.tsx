import React from 'react';
import BN from 'bignumber.js';
import { Box as MBox, Typography} from '@material-ui/core';
import { Box, Flex, Button} from '@chakra-ui/react';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';

import { CurrencyType } from '../../lib/trading/currencyTypes';
import { CurrencySelector } from './Currencies/CurrencySelector';

import { SIGNIFICANT_DIGITS, significantNumbers } from '../../lib/numbers';

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
  disabledInput: {
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.default,
  },
}));

const Container = styled.div`
  & + & {
    margin-top: 10px;
  }
`;

type Props = {
  value: string | null;
  selectedSymbol: string;
  onChangeValue: (string) => void;
  onChangeCurrency: (string) => void;
  onMax?: () => void;
  currencyType: CurrencyType;
  active: boolean;
  disabled?: boolean;
  valueDisabled?: boolean;
  currencyDisabled?: boolean;
  error: boolean;
  caption: string;
  balanceAvailable?: string;
};

export const AmountRow: React.FC<Props> = ({ value, selectedSymbol, onChangeValue, onChangeCurrency, currencyType, active, error, valueDisabled, currencyDisabled, caption, onMax, balanceAvailable }) => {
  const classes = useStyles();

  const displayedValue = value !== null ?
    (active ? value : new BN(value).sd(SIGNIFICANT_DIGITS).toFixed())
    : '';

  return (
    <Container>
      <Flex px={4} pb={2} justify="space-between">
        <Typography variant="caption">
          {caption}
        </Typography>
        {balanceAvailable && balanceAvailable !== '0' &&
          <Button
            variant="link"
            onClick={onMax}
            disabled={!onMax}
            _disabled={{
              color: 'gray.400',
            }}
          >
            Available: {significantNumbers(balanceAvailable)}
          </Button>
        }
      </Flex>
      <MBox className={[classes.rowRoot, valueDisabled && classes.disabledRow, active && classes.activeRow, error && classes.errorRow].join(' ')}>
        <MBox flex={1}>
          <input
            type="number"
            className={[classes.amountInput, valueDisabled && classes.disabledInput].join(' ')}
            value={displayedValue}
            onChange={e => onChangeValue(e.target.value)}
            readOnly={valueDisabled}
            min={0}
          />
        </MBox>
        <Box>
          <CurrencySelector
            selectedSymbol={selectedSymbol}
            onChange={onChangeCurrency}
            disabled={currencyDisabled}
            currencyType={currencyType}
          />
        </Box>
      </MBox>
    </Container>
  );
};
