import React, { useState, useEffect, useContext, useRef, MutableRefObject } from 'react';
import { useSelector } from 'react-redux';
import InfiniteScroll from "react-infinite-scroller";

import { Box, Dialog, DialogContent, DialogTitle, List, ListItem, ListItemAvatar, ListItemText, Avatar } from '@material-ui/core';

import { CurrencyLogo } from './CurrencyLogo';
import styled from 'styled-components';
import { textStyle, LoadingRing } from '@aragon/ui'
import { amountToDecimal, BN, truncateNumber } from '../../../lib/numbers';
import { CurrenciesMap, Currency } from '../../../lib/trading/currencyTypes';
import { CurrenciesContext } from '../../../contexts/CurrenciesContext';
import { CurrencyBalances } from '../../../lib/wrappers/paraswap';
import { ETHER } from '../../../lib/trading/currencyList';
import { getWalletStatus } from '../../../redux/wallet/selectors';
import { WalletStatus } from '../../../redux/wallet/state';
import { useTokenList } from '../../../hooks/currencies';

const Title = styled.p`
  ${textStyle('title4')};
  text-align: center;
`;

const CurrencyLogoAvatar = styled(Avatar)`
  width: 20px;
  height: 20px;
  && {
    background: none;
  }
`
// const DialogContent = styled(Box)`
//   width: 400px;
// `

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

type TokenSelectorModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectToken: (CurrencySymbol) => void;
};

type TokenListProps = {
  onSelectToken: (CurrencySymbol) => void;
  searchValue: string;
  scrollRef: React.RefObject<HTMLElement>;
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

const LoadingRow: React.FC = () => {
  return (
    <ListItem>
      <ListItemAvatar>
        <LoadingRing mode="half-circle"/>
      </ListItemAvatar>
      <ListItemText>
        <CurrencySymbolText>Loading more...</CurrencySymbolText>
      </ListItemText>
    </ListItem>
  );
};

const TOKEN_PAGINATION = 10;
const TokenList: React.FC<TokenListProps> = ({ onSelectToken, searchValue, scrollRef }) => {
  const currencyList = useTokenList(searchValue);
  const [itemList, setItemList] = useState<Currency[]>(currencyList.slice(0, TOKEN_PAGINATION));
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const fetchMore = () => {
    const si = page*TOKEN_PAGINATION;
    if(si > currencyList.length) {
      setHasMore(false);
      return;
    }

    setItemList(itemList.concat(currencyList.slice(si, si+TOKEN_PAGINATION)));
    setPage(page+1);
  }
  useEffect(() => {
    setItemList(currencyList.slice(0, TOKEN_PAGINATION));
    setHasMore(currencyList.length > TOKEN_PAGINATION);
    setPage(1);
  }, [currencyList]);

  return (
    <List>
      <InfiniteScroll
        loadMore={fetchMore}
        hasMore={hasMore}
        loader={<LoadingRow key="loader" />}
        useWindow={false}
        getScrollParent={() => scrollRef?.current}
      >
        {itemList.map(currency => (
          <ListItem key={currency.symbol} button onClick={() => onSelectToken(currency.symbol)}>
            <TokenRow currency={currency} />
          </ListItem>
        ))}
      </InfiniteScroll>
    </List>
  );
}


export const TokenSelectorModal: React.FC<TokenSelectorModalProps> = ({ open, onClose, onSelectToken }) => {
  const dialogRef = useRef<HTMLElement>(null);
  const [searchValue, setSearchValue] = useState<string>("");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      <DialogTitle disableTypography>
        <Title>
          Select token
        </Title>
      </DialogTitle>
      <DialogContent>
        <input value={searchValue} onChange={e => setSearchValue(e.target.value)} type="text" />
      </DialogContent>
      <DialogContent ref={dialogRef}>
        <TokenList onSelectToken={onSelectToken} scrollRef={dialogRef} searchValue={searchValue}/>
      </DialogContent>
    </Dialog>
  );
}
