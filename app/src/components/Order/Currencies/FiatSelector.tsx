import React from 'react';
import { Box} from '@material-ui/core';

import { DropDown } from '@aragon/ui'

import { CurrencyLogo } from './CurrencyLogo';
import styled from 'styled-components';
import { fiatCurrencies } from '../../../lib/trading/currencyList';

function CurrencyItem({ symbol }) {
  return (
    <Box display="flex" alignItems="center">
      <CurrencyLogo symbol={symbol} width="20px"/>
      <Box ml={1} fontSize="1.2rem">{symbol}</Box>
    </Box>
  );
}

const CustomDropDown = styled(DropDown)`
  border: none;
  outline: none;
  svg {
    margin-left: 0.5rem;
  }
`;

const outputCurrencies: string[] = fiatCurrencies.map(c => c.symbol);

type Props = {
  selectedSymbol: string;
  onChange: (string) => void;
  disabled?: boolean;
};

export const FiatSelector: React.FC<Props> = ({ selectedSymbol, onChange, disabled }) => {
  return (
    <CustomDropDown
      items={outputCurrencies.map(symbol => <CurrencyItem symbol={symbol}/>)}
      selected={outputCurrencies.indexOf(selectedSymbol)}
      onChange={i => onChange(outputCurrencies[i])}
      disabled={disabled}
      wide
    />
  );
};
