import React, { Suspense, useMemo } from 'react';
import {useImage} from 'react-image';

import tokenDefaultImage  from '../../../assets/token_default.svg';
import { CurrencyType, TokenCurrency } from '../../../lib/trading/currencyTypes';
import { Box } from '@material-ui/core';
import { ETHER } from '../../../lib/trading/currencyList';
import { useCurrency } from '../../../hooks/currencies';

const CurrencyLogoImage = ({src, symbol}) => (
  <img
    src={src}
    alt={`coin-icon-${symbol}`}
    width="100%"
  />
)

function CurrencyLogoLoader({symbol}) {
  const currency = useCurrency(symbol);

  const defaultSrc = useMemo(() => {
    if(!currency) return tokenDefaultImage;
    else if(currency.equals(ETHER)) {
      return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
    } else if(currency.img && currency.img !== 'https://img.paraswap.network/token.png') {
      return currency.img;
    } else if(currency.type === CurrencyType.FIAT){
      return `/images/coinIcons/${currency.symbol}.svg`;
    } else if(currency.type === CurrencyType.ERC20){
      const tokenAddress = (currency as TokenCurrency).address;
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`;
    } else {
      return tokenDefaultImage;
    }
  }, [currency]);

  const {src} = useImage({
    srcList: [
      defaultSrc,
      tokenDefaultImage,
    ],
  });

  return <CurrencyLogoImage src={src} symbol={symbol}/>;
}

export const CurrencyLogo = ({symbol, width='100%'}) => (
  <Box width={width} display="flex" alignItems="center">
    <Suspense
      fallback={<CurrencyLogoImage src={tokenDefaultImage} symbol={symbol} />}
    >
      <CurrencyLogoLoader symbol={symbol}/>
    </Suspense>
  </Box>
);
