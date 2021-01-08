import React from 'react';
import { Box, Typography, Tooltip} from '@material-ui/core';
import { Link } from '@aragon/ui'
import {CurrencyType} from '../lib/trading/currencyTypes';
import {BN, truncateNumber} from '../lib/numbers';
import { Fee, MultiTradeEstimation, Trade, TradeType } from '../lib/trading/types'
import {MetaError} from "../lib/errors";
import styled from 'styled-components';

import bityLogo from "../assets/bity_logo_small.png";
import paraswapLogo from "../assets/paraswap_logo_small.png";
import { getCurrency } from '../lib/trading/currencyHelpers'

function aggregateFees(multiTradeEstimation: MultiTradeEstimation): Fee | null {
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

const Container = styled.div`
background: #FCFDFF;
border: 1px solid #ececec;
box-sizing: border-box;
box-shadow: 2px 2px 4px rgba(86, 86, 86, 0.1);
border-radius: 27px;
width: 100%;
padding: 15px 20px;
margin: 20px 0;
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
const ServiceLogo: React.FC<ServiceLogoProps> = ({tradeType}) => {
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
  const dd = d[tradeType];

  return (
    <Link external href={dd.href} display="flex" alignItems="center">
      <Tooltip title={dd.tooltip}>
        <Box display="flex" alignItems="center">
          <img src={dd.image} alt={dd.alt} height={20} />
        </Box>
      </Tooltip>
    </Link>
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

interface RateAmountProps {
  multiTradeEstimation: MultiTradeEstimation;
}
export const RateAmount: React.FC<RateAmountProps> = ({multiTradeEstimation}) => {
  const inputSymbol = multiTradeEstimation.tradeRequest.inputCurrencySymbol;
  const outputSymbol = multiTradeEstimation.tradeRequest.outputCurrencySymbol;

  const fee = aggregateFees(multiTradeEstimation);
  let feeAmount, feeCurrency;
  if(fee) {
    feeCurrency = getCurrency(fee.currencySymbol);
    if(feeCurrency.type === CurrencyType.FIAT) {
      feeAmount = truncateNumber(fee.amount, 2);
    } else {
      feeAmount = truncateNumber(fee.amount);
    }
  }
  const rate = new BN(multiTradeEstimation.outputAmount).div(multiTradeEstimation.inputAmount);
  const rateTrunc = truncateNumber(rate);

  return (
    <Container>
      <Box px={1}>
        <BasicLine title="Rate" content={`~${rateTrunc} ${outputSymbol}/${inputSymbol}`}/>
        {fee &&
        <BasicLine title="Exchange fees" content={`${feeAmount} ${feeCurrency.symbol}`}/>
        }
      </Box>
      <RouteTitle>Order Routing</RouteTitle>
      {multiTradeEstimation.trades.map(trade => <TradeLine trade={trade} key={trade.tradeType} />)}
    </Container>
  );
}
