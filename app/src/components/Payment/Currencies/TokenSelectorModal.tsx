import React, { useState, useEffect, useContext } from 'react';

import { Box, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, Avatar } from '@material-ui/core';

import { CurrencyLogo } from './CurrencyLogo';
import styled from 'styled-components';
import { textStyle } from '@aragon/ui'
import { amountToDecimal, BN, truncateNumber } from '../../../lib/numbers';
import { CurrenciesMap, Currency } from '../../../lib/trading/currencyTypes';
import { CurrenciesContext } from '../../../contexts/CurrenciesContext';
import { CurrencyBalances } from '../../../lib/wrappers/paraswap';
import { ETHER } from '../../../lib/trading/currencyList';

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
  currency: Currency;
};

const TokenRow: React.FC<TokenRowProps> = ({ currency }) => {
  const { currencyBalances } = useContext(CurrenciesContext);
  const currencyBalance = currencyBalances[currency.symbol];

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

          {currencyBalance && (
            <CurrencyAmountText>
              {truncateNumber(amountToDecimal(currencyBalance.balance, currency.decimals))}
            </CurrencyAmountText>
          )}
        </Box>
      </ListItemText>
    </>
  );
};

function sortCurrenciesByBalance(currencies: Currency[], currencyBalances: CurrencyBalances) {
  return currencies.sort((a, b) => {
    if(a.equals(ETHER)) return -1;
    else if(b.equals(ETHER)) return 1;
    else if (currencyBalances[a.symbol] && currencyBalances[b.symbol]) {
      const av = amountToDecimal(currencyBalances[a.symbol].balance, a.decimals);
      const bv = amountToDecimal(currencyBalances[b.symbol].balance, b.decimals);
      const diff = new BN(bv).minus(av);
      return diff.gt(0) ? 1:-1;
    } else if (currencyBalances[a.symbol] && !currencyBalances[b.symbol]) {
      return -1;
    } else if (!currencyBalances[a.symbol] && currencyBalances[b.symbol]) {
      return 1;
    } else {
      return 0;
    }
  })
}

function onlyHeldCurrencies(currenciesMap: CurrenciesMap, currencyBalances: CurrencyBalances): Currency[] {
  const heldCurrencies = Object.keys(currencyBalances)
    .map(symbol => currenciesMap[symbol])
    .filter(c => c !== undefined) as Currency[];

  return sortCurrenciesByBalance(heldCurrencies, currencyBalances);
}

export const TokenSelectorModal: React.FC<Props> = ({ open, onClose, onSelectToken }) => {
  const { inputCurrenciesMap, currencyBalances } = useContext(CurrenciesContext);

  const [currencyList, setCurrencyList] = useState<Currency[]>([]);

  useEffect(() => {
      setCurrencyList(onlyHeldCurrencies(inputCurrenciesMap, currencyBalances));
    },
    [inputCurrenciesMap, currencyBalances]
  );

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
          {currencyList.map(currency => (
            <ListItem key={currency.symbol} button onClick={() => onSelectToken(currency.symbol)}>
              <TokenRow currency={currency} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
