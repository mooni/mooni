import React  from 'react';
import {useSelector} from 'react-redux';

import { Box, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, Avatar } from '@material-ui/core';

import { getInputCurrencies } from '../../../redux/ui/selectors';
import { CurrencyLogo } from './CurrencyLogo';
import styled from 'styled-components';
import { textStyle, LoadingRing } from '@aragon/ui'
import { CurrencySymbol } from '../../../lib/trading/types';
import { useCurrency } from '../../../hooks/currencies';
import { useBalance } from '../../../hooks/balance';
import { truncateNumber } from '../../../lib/numbers';

const Title = styled.p`
  ${textStyle('title4')};
  text-align: center;
`;

const CurrencyLogoAvatar = styled(Avatar)`
  width: 20px;
  height: 20px;
`
const DialogContent = styled(Box)`
  width: 400px;
`

const CurrencySymbolText = styled.span`
`;
const CurrencyNameText = styled.span`
  font-style: italic;
    margin-left: 4px;
    font-weight: lighter;
    color: #4b5155;
`;
const CurrencyAmountText = styled.span`
  font-weight: lighter;
  color: #4b5155;
`;

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectToken: (CurrencySymbol) => void;
};

type TokenRowProps = {
  symbol: CurrencySymbol;
};

const TokenRow: React.FC<TokenRowProps> = ({ symbol }) => {
  const currency = useCurrency(symbol);
  const { balance, balanceLoading, balanceAvailable } = useBalance(symbol);

  return (
    <>
      <ListItemAvatar>
        <CurrencyLogoAvatar>
          <CurrencyLogo symbol={currency.symbol}/>
        </CurrencyLogoAvatar>
      </ListItemAvatar>
      <ListItemText>
        <Box display="flex">
          <Box flex={1}>
            <CurrencySymbolText>{currency.symbol}</CurrencySymbolText>
            {currency.name &&
            <CurrencyNameText>{currency.name}</CurrencyNameText>
            }
          </Box>

          {balanceAvailable && (
            balanceLoading ?
              <LoadingRing/>
              :
              <CurrencyAmountText>
                {truncateNumber(balance)}
              </CurrencyAmountText>
          )}
        </Box>
      </ListItemText>
    </>
  );
};

export const TokenSelectorModal: React.FC<Props> = ({ open, onClose, onSelectToken }) => {
  const inputCurrencies = useSelector(getInputCurrencies);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
    >
      <DialogTitle disableTypography>
        <Title>
          Select token
        </Title>
      </DialogTitle>
      <DialogContent>
        <List>
          {inputCurrencies.map(symbol => (
            <ListItem key={symbol} button onClick={() => onSelectToken(symbol)}>
              <TokenRow symbol={symbol}/>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
