import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { CurrencyType } from '../lib/trading/currencyTypes';
import {BN, SIGNIFICANT_DIGITS} from '../lib/numbers';
import { Fee, MultiTrade } from '../lib/trading/types';
import {MetaError} from "../lib/errors";

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


export default function RateAmount({ multiTrade }: {multiTrade: MultiTrade}) {
  const inputSymbol = multiTrade.multiTradeRequest.tradeRequest.inputCurrency.symbol;
  const outputSymbol = multiTrade.multiTradeRequest.tradeRequest.outputCurrency.symbol;

  const fee = aggregateFees(multiTrade);
  let feeAmount;
  if(fee) {
    if(fee.currency.type === CurrencyType.FIAT) {
      feeAmount = new BN(fee.amount).dp(2).toFixed();
    } else {
      feeAmount = new BN(fee.amount).sd(SIGNIFICANT_DIGITS).toFixed();
    }
  }
  const rate = new BN(multiTrade.outputAmount).div(multiTrade.inputAmount).sd(SIGNIFICANT_DIGITS).toFixed();

  return (
    <Box p={2}>
      <Typography variant="caption">
        <b>Rate:</b> ~{rate} {outputSymbol}/{inputSymbol}
      </Typography>
      {fee &&
      <Typography variant="caption">
        <span><br/><b>Fees:</b> {feeAmount} {fee.currency.symbol}</span>
      </Typography>
      }
    </Box>
  );
}
