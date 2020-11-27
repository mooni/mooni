import {
  MultiTrade,
  MultiTradeRequest,
  TradePath,
  TradeType,
  BityTrade,
  Trade,
} from "./types";
import { CurrencyType, ETHER } from './currencies';
import {JSBI} from '../numbers';
import BityProxy from "./bityProxy";
import {bityDefaultInstance as bity} from "./bity";

// import {TradeExact} from "../types";

function findPath(multiTradeRequest: MultiTradeRequest): TradePath {
  if(
    multiTradeRequest.tradeRequest.inputCurrency.equals(ETHER)
    &&
    multiTradeRequest.tradeRequest.outputCurrency.type === CurrencyType.FIAT
  ) {
    return [
      TradeType.BITY,
    ];

  } else if(
    multiTradeRequest.tradeRequest.inputCurrency.type === CurrencyType.ERC20
    &&
    multiTradeRequest.tradeRequest.outputCurrency.type === CurrencyType.FIAT
  ) {
    return [
      TradeType.DEX,
      TradeType.BITY,
    ];

  } else {
    throw new Error('Invalid path');
  }
}

export async function estimateMultiTrade(multiTradeRequest: MultiTradeRequest): Promise<MultiTrade> {
  const path = findPath(multiTradeRequest);
  const { tradeRequest } = multiTradeRequest;

  const trades: Trade[] = [];

  if(path.length === 1 && path[0] === TradeType.BITY) {
    const bityRate = await bity.estimate(tradeRequest);

    const trade: Trade = {
      tradeRequest: tradeRequest,
      inputAmount: JSBI.BigInt(tradeRequest.amount),
      outputAmount: JSBI.BigInt(bityRate.outputAmount),
      fee: bityRate.fee,
    };

    trades.push(trade);
  }
  else {
    throw new Error('Unsupported path');
  }

  return {
    multiTradeRequest,
    trades,
    path,
    inputAmount: trades[0].inputAmount,
    outputAmount: trades[trades.length - 1].outputAmount,
  };
  // TODO total fees
}

export async function createMultiTrade(multiTradeRequest: MultiTradeRequest, jwsToken: string): Promise<MultiTrade> {
  if(!multiTradeRequest.bankInfo) {
    throw new Error('Bity requires bank info')
  }
  if(!multiTradeRequest.ethInfo) {
    throw new Error('Bity requires eth info')
  }

  const path = findPath(multiTradeRequest);

  const trades: Trade[] = [];

  if(path.length === 1 && path[0] === TradeType.BITY) {

    const { tradeRequest, bankInfo, ethInfo } = multiTradeRequest;
    const bityOrderResponse = await BityProxy.createOrder(
      tradeRequest, bankInfo, ethInfo, jwsToken
    );
    const bityTrade: BityTrade = {
      tradeRequest,
      inputAmount: JSBI.BigInt(bityOrderResponse.input.amount),
      outputAmount: JSBI.BigInt(bityOrderResponse.output.amount),
      bityOrderResponse,
    };

    trades.push(bityTrade);
  }
  else {
    throw new Error('Unsupported path');
  }

  return {
    multiTradeRequest,
    trades,
    inputAmount: trades[0].inputAmount,
    outputAmount: trades[trades.length - 1].outputAmount,
    path: path,
  };
  // TODO fees
}
