import React from 'react';
import { Box} from '@material-ui/core';

import { DropDown } from '@aragon/ui'

import {getCurrenciesSymbols} from '../../../lib/trading/currencyHelpers';
import {CurrencyType} from "../../../lib/trading/currencyTypes";
import { CurrencyLogo } from './CurrencyLogo';
import styled from 'styled-components';

function CurrencyItem({ symbol }) {
  return (
    <Box display="flex" alignItems="center">
      <CurrencyLogo symbol={symbol} width="20px"/>
      <Box ml={1}>{symbol}</Box>
    </Box>
  );
}

const CustomDropDown = styled(DropDown)`
  border-radius: 20px;
  border-color: #aecfd6;
`;

const outputCurrencies: string[] = getCurrenciesSymbols(CurrencyType.FIAT);

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
