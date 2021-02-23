import React from 'react';
import BN from 'bignumber.js';
import { Box, Button} from '@chakra-ui/react';
import styled from 'styled-components';
import { textStyle } from '@aragon/ui';

import { CurrencyType } from '../../lib/trading/currencyTypes';
import { CurrencySelector } from './Currencies/CurrencySelector';

import { SIGNIFICANT_DIGITS, significantNumbers } from '../../lib/numbers';

const Container = styled.div`
  & + & {
    margin-top: 1rem;
  }

  border: 1px solid #eff3f5;
  background-color: ${props => props.theme.surface};
  border-radius: 20px;

  &.active {
    border: 1px solid #c7e6ea;
  }

  &.error {
    border: 1px solid #e3a79f;
  }
`;

const RowLabel = styled.span`
  ${textStyle('label1')};
  text-transform: initial;
  color: #4c4c4c;
`;

const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.75rem;
`;

const InputContainer = styled.div`
  display: flex;
  height: 62px;
  align-items: center;

  padding: 1rem 1rem 0.75rem;
`;

const Input = styled.input`
  flex: 1 1 auto;

  border: none;
  outline: none;
  width: 100%;
  text-align: start;
  height: 35px;
  background-color: ${props => props.theme.surface};
  color: ${props => props.theme.content};

  font-weight: 500;
  font-size: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0;
  
  &:focus {
    outline: none;
  }

  &.disabled {
    color: ${props => props.theme.contentSecondary};
    background-color: ${props => props.theme.surface};
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

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}


export const AmountRow: React.FC<Props> = ({ value, selectedSymbol, onChangeValue, onChangeCurrency, currencyType, active, error, valueDisabled, currencyDisabled, caption, onMax, balanceAvailable }) => {
  const displayedValue = value !== null ?
    (active ? value : new BN(value).sd(SIGNIFICANT_DIGITS).toFixed())
    : '';

  return (
    <Container className={[valueDisabled && 'disabled', active && 'active', error && 'error'].join(' ')}>
      <LabelContainer>
        <RowLabel>
          {caption}
        </RowLabel>

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
      </LabelContainer>
      <InputContainer>
        <Input
          className={[valueDisabled && 'disabled'].join(' ')}
          value={displayedValue}
          readOnly={valueDisabled}
          min={0}
          onChange={event => {
            const nextUserInput = event.target.value.replace(/,/g, '.');
            if (nextUserInput === '') {
              onChangeValue('0')
            } else if (inputRegex.test(escapeRegExp(nextUserInput))) {
              onChangeValue(nextUserInput)
            }
          }}
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          type="text"
          pattern="^[0-9]*[.,]?[0-9]*$"
          placeholder="0.0"
          minLength={1}
          maxLength={79}
          spellCheck="false"
        />
        <Box>
          <CurrencySelector
            selectedSymbol={selectedSymbol}
            onChange={onChangeCurrency}
            disabled={currencyDisabled}
            currencyType={currencyType}
          />
        </Box>
      </InputContainer>
    </Container>
  );
};
