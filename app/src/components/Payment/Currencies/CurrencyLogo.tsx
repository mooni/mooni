import React, { Suspense } from 'react';
import {useImage} from 'react-image';

import { getCurrency, getCurrencyLogoAddress } from '../../../lib/trading/currencyHelpers';
import tokenDefaultImage  from '../../../assets/token_default.png';
import {Currency} from "../../../lib/trading/currencyTypes";

const CurrencyLogoImage = ({src, symbol}) => (
  <img
    src={src}
    alt={`coin-icon-${symbol}`}
    width={20}
  />
)

function CurrencyLogoLoader({symbol}) {
  const currency = getCurrency(symbol);
  const {src} = useImage({
    srcList: [
      (currency as Currency).img,
      getCurrencyLogoAddress(symbol),
      tokenDefaultImage,
    ],
  });

  return <CurrencyLogoImage src={src} symbol={symbol}/>;
}

export const CurrencyLogo = ({symbol}) => (
  <Suspense
    fallback={<CurrencyLogoImage src={tokenDefaultImage} symbol={symbol} />}
  >
    <CurrencyLogoLoader symbol={symbol}/>
  </Suspense>
);
