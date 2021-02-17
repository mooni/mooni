import React, { useMemo } from 'react';
import { Box, Typography, Tooltip} from '@material-ui/core';
import { Image } from '@chakra-ui/react'
import { LoadingRing } from '@aragon/ui'
import styled from 'styled-components';
import {CurrencyType} from '../../lib/trading/currencyTypes';
import {BN, truncateNumber} from '../../lib/numbers';
import { Fee, MultiTradeEstimation, Trade, TradeType } from '../../lib/trading/types'
import {MetaError} from "../../lib/errors";
import { ExternalLink, ShadowBox } from '../UI/StyledComponents';

import bityLogo from "../../assets/bity_logo_small.png";
import paraswapLogo from "../../assets/paraswap_logo_small.png";
import { useCurrenciesContext } from '../../hooks/currencies';

function aggregateFees(multiTradeEstimation: MultiTradeEstimation, getCurrency): Fee | null {
  const fees = multiTradeEstimation.trades.map(t => t.fee).filter(f => !!f) as Fee[];

  if(fees.length === 0) {
    return null;
  }

  const lastTrade = multiTradeEstimation.trades[multiTradeEstimation.trades.length-1];

  const expectedFeeCurrency = getCurrency(lastTrade.tradeRequest.inputCurrencySymbol);
  const desiredFeeCurrency = getCurrency(lastTrade.tradeRequest.outputCurrencySymbol);

  // TODO support multiple fee currencies
  // expect the fees to be ~ETH
  const sameCurrencies = new Set(
    fees.map(f => f.currencySymbol).concat(expectedFeeCurrency.symbol)
  ).size === 1;

  if(!sameCurrencies) {
    throw new MetaError('Incompatible fee currencies', fees);
  }

  const totalFeesAmount = fees
    .map(f => f.amount)
    .reduce((acc, a) => acc.plus(a), new BN(0));

  const lastTradeRate = new BN(lastTrade.outputAmount).div(lastTrade.inputAmount);

  const feeAmountInOutput = totalFeesAmount.times(lastTradeRate).toFixed();

  return {
    amount: feeAmountInOutput,
    currencySymbol: desiredFeeCurrency.symbol,
  };
}

// @ts-ignore
const Container = styled(ShadowBox)`
width: 100%;
padding: 15px 20px;
`;

const RouteTitle = styled.p`
font-family: Roboto;
font-style: normal;
font-weight: 200;
font-size: 12px;
line-height: 25px;
color: #504E4E;
text-align: center;
text-transform: uppercase;
`;

const RouteAmount = styled.span`
font-family: Roboto;
font-style: normal;
font-weight: normal;
font-size: 12px;
line-height: 12px;
`;

const Via = styled.span`
font-family: Roboto;
font-style: normal;
font-weight: 200;
font-size: 12px;
line-height: 14px;
margin-right: 5px;
text-transform: lowercase;
`;

const TradeElement = styled.div`
height: 35px;
display: flex;
align-items: center;

& + & {
  border-top: 0.5px solid #D9D0D0;
}
`;

interface BasicLineProps {
  title: string;
  content: string;
}
const BasicLine: React.FC<BasicLineProps> = ({title, content}) => (
  <Box display="flex">
    <Box>
      <Typography variant="caption">
        <b>{title}</b>
      </Typography>
    </Box>
    <Box flex={1} textAlign="right">
      <Typography variant="caption">
        {content}
      </Typography>
    </Box>
  </Box>
);

interface ServiceLogoProps {
  tradeType: TradeType;
}
const d = {
  [TradeType.BITY]: {
    tooltip: "Bity - Swiss crypto-fiat exchange",
    href: "https://bity.com",
    alt: "bity",
    image: bityLogo,
  },
  [TradeType.DEX]: {
    tooltip: "Paraswap - DEX aggregator",
    href: "https://paraswap.io",
    alt: "paraswap",
    image: paraswapLogo,
  }
};
const ServiceLogo: React.FC<ServiceLogoProps> = ({tradeType}) => {
  const dd = d[tradeType];

  return (
    <ExternalLink href={dd.href}>
      <Tooltip title={dd.tooltip}>
        <Box display="flex" alignItems="center">
          <Image src={dd.image} alt={dd.alt} height="20px" />
        </Box>
      </Tooltip>
    </ExternalLink>
  );
}

interface TradeLineProps {
  trade: Trade;
}
const TradeLine: React.FC<TradeLineProps> = ({trade}) => (
  <TradeElement>
    <Box flex={1}>
      <RouteAmount>
        {truncateNumber(trade.inputAmount)} {trade.tradeRequest.inputCurrencySymbol}
        <b>{' > '}</b>
        {truncateNumber(trade.outputAmount)} {trade.tradeRequest.outputCurrencySymbol}
      </RouteAmount>
    </Box>
    <Box height={30} display="flex" alignItems="center">
      <Via>VIA</Via>
      {' '}
      <ServiceLogo tradeType={trade.tradeType} />
    </Box>
  </TradeElement>
);

export const RateAmountSuspense: React.FC = () => {
  return (
    <Container>
      <Box px={1}>
        <BasicLine title="Rate" content={"-"}/>
        <BasicLine title="Exchange fees" content="-"/>
      </Box>
      <Box display="flex" justifyContent="center" mt={1}>
        <LoadingRing mode="half-circle"/>
      </Box>
    </Container>
  );
}

interface RateAmountLoadedProps {
  multiTradeEstimation: MultiTradeEstimation;
}

export const RateAmountLoaded: React.FC<RateAmountLoadedProps> = ({multiTradeEstimation}) => {
  const { getCurrency } = useCurrenciesContext();

  const inputSymbol = multiTradeEstimation.tradeRequest.inputCurrencySymbol;
  const outputSymbol = multiTradeEstimation.tradeRequest.outputCurrencySymbol;

  const fee = useMemo(() => aggregateFees(multiTradeEstimation, getCurrency), [multiTradeEstimation, getCurrency]);
  const feeInfos = useMemo(() => {
    let amount, currency;
    if(fee) {
      currency = getCurrency(fee.currencySymbol);
      if(currency.type === CurrencyType.FIAT) {
        amount = truncateNumber(fee.amount, 2);
      } else {
        amount = truncateNumber(fee.amount);
      }
      return {
        currency,
        amount,
      }
    }
    return null;
  }, [fee, getCurrency]);

  const rateTrunc = useMemo(() => {
    const rate = new BN(multiTradeEstimation.outputAmount).div(multiTradeEstimation.inputAmount);
    return truncateNumber(rate);
  }, [multiTradeEstimation]);

  return (
    <Container>
      <Box px={1}>
        <BasicLine title="Rate" content={`~${rateTrunc} ${outputSymbol}/${inputSymbol}`}/>
        {feeInfos &&
        <BasicLine title="Exchange fees" content={`${feeInfos.amount} ${feeInfos.currency.symbol}`}/>
        }
      </Box>
      <RouteTitle>Order Routing</RouteTitle>
      {multiTradeEstimation.trades.map(trade => <TradeLine trade={trade} key={trade.tradeType} />)}
    </Container>
  );
}

interface RateAmountProps {
  multiTradeEstimation: MultiTradeEstimation | null;
}
export const RateAmount: React.FC<RateAmountProps> = ({multiTradeEstimation}) => {
  if(multiTradeEstimation) {
    return (
      <RateAmountLoaded multiTradeEstimation={multiTradeEstimation}/>
    )
  } else {
    return (
      <RateAmountSuspense />
    );
  }
}
