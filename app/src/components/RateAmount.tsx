import React from 'react';
import { Box, Typography, Tooltip} from '@material-ui/core';
import { Link } from '@aragon/ui'
import {CurrencyType} from '../lib/trading/currencyTypes';
import {BN, truncateNumber} from '../lib/numbers';
import {Fee, MultiTrade, Trade, TradeType} from '../lib/trading/types';
import {MetaError} from "../lib/errors";
import styled from 'styled-components';

import bityLogo from "../assets/bity_logo_small.png";
import paraswapLogo from "../assets/paraswap_logo_small.png";

function aggregateFees(multiTrade: MultiTrade): Fee | null {
  const fees = multiTrade.trades.map(t => t.fee).filter(f => !!f) as Fee[];

  if(fees.length === 0) {
    return null;
  }

  const lastTrade = multiTrade.trades[multiTrade.trades.length-1];

  const expectedFeeCurrency = lastTrade.tradeRequest.inputCurrency;
  const desiredFeeCurrency = lastTrade.tradeRequest.outputCurrency;

  // TODO support multiple fee currencies
  // expect the fees to be ~ETH
  const sameCurrencies = new Set(
    fees.map(f => f.currency.symbol).concat(expectedFeeCurrency.symbol)
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
    currency: desiredFeeCurrency,
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

interface TradeLineProps {
  trade: Trade;
  index: number;
}

function ServiceLogo({tradeType}) {
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

const TradeLine: React.FC<TradeLineProps> = ({trade, index}) => (
  <TradeElement>
    <Box flex={1}>
      <RouteAmount>
        {truncateNumber(trade.inputAmount)} {trade.tradeRequest.inputCurrency.symbol}
        <b>{' > '}</b>
        {truncateNumber(trade.outputAmount)} {trade.tradeRequest.outputCurrency.symbol}
      </RouteAmount>
    </Box>
    <Box height={30} display="flex" alignItems="center">
      <Via>VIA</Via>
      {' '}
      <ServiceLogo tradeType={trade.tradeType} />
    </Box>
  </TradeElement>
);

export default function RateAmount({ multiTrade }: {multiTrade: MultiTrade}) {
  const inputSymbol = multiTrade.multiTradeRequest.tradeRequest.inputCurrency.symbol;
  const outputSymbol = multiTrade.multiTradeRequest.tradeRequest.outputCurrency.symbol;

  const fee = aggregateFees(multiTrade);
  let feeAmount;
  if(fee) {
    if(fee.currency.type === CurrencyType.FIAT) {
      feeAmount = truncateNumber(fee.amount, 2);
    } else {
      feeAmount = truncateNumber(fee.amount);
    }
  }
  const rate = new BN(multiTrade.outputAmount).div(multiTrade.inputAmount);
  const rateTrunc = truncateNumber(rate);

  return (
    <Container>
      <Box px={1}>
        <BasicLine title="Rate" content={`~${rateTrunc} ${outputSymbol}/${inputSymbol}`}/>
        {fee &&
        <BasicLine title="Fees" content={`${feeAmount} ${fee.currency.symbol}`}/>
        }
      </Box>
      <RouteTitle>Order Routing</RouteTitle>
      {multiTrade.trades.map((trade, i) => <TradeLine trade={trade} index={i} />)}
    </Container>
  );
}
