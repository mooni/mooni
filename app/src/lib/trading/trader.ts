import {BityTrade, MultiTrade, MultiTradeRequest, Trade, TradePath, TradeRequest, TradeType,} from "./types";
import {CurrencyType, ETHER} from './currencies';
import BityProxy from "./bityProxy";
import {TradeExact} from "../types";
import DexProxy from "./dexProxy";

function findPath(tradeRequest: TradeRequest): TradePath {
  if(
    tradeRequest.inputCurrency.equals(ETHER)
    &&
    tradeRequest.outputCurrency.type === CurrencyType.FIAT
  ) {
    return [
      TradeType.BITY,
    ];

  } else if(
    tradeRequest.inputCurrency.type === CurrencyType.ERC20
    &&
    tradeRequest.outputCurrency.type === CurrencyType.CRYPTO && tradeRequest.outputCurrency.symbol === ETHER.symbol
  ) {
    return [
      TradeType.DEX,
    ];

  } else if(
    tradeRequest.inputCurrency.type === CurrencyType.ERC20
    &&
    tradeRequest.outputCurrency.type === CurrencyType.FIAT
  ) {
    return [
      TradeType.DEX,
      TradeType.BITY,
    ];

  } else {
    throw new Error('Invalid path');
  }
}

async function estimateTrade(tradeRequest: TradeRequest): Promise<Trade> {
  const path = findPath(tradeRequest);
  if(path.length !== 1) {
    throw new Error('can only estimate direct trade');
  }
  const tradeType = path[0];
  if(tradeType === TradeType.BITY) {
    return BityProxy.estimateOrder(tradeRequest);
  }
  else if(tradeType === TradeType.DEX) {
    return DexProxy.getRate(tradeRequest);
  } else {
    throw new Error(`Estimation not available for TradeType ${tradeType}'`);
  }
}

async function createTrade(multiTradeRequest: MultiTradeRequest): Promise<Trade> {
  const path = findPath(tradeRequest);
  if(path.length !== 1) {
    throw new Error('can only estimate direct trade');
  }
  const tradeType = path[0];
  if(tradeType === TradeType.BITY) {
    // TODO token
    return BityProxy.createOrder(multiTradeRequest, multiTradeRequest.bankInfo, multiTradeRequest.ethInfo);
  }
  else if(tradeType === TradeType.DEX) {
    return DexProxy.getRate(tradeRequest);
  } else {
    throw new Error(`Estimation not available for TradeType ${tradeType}'`);
  }
}

export async function estimateMultiTrade(multiTradeRequest: MultiTradeRequest): Promise<MultiTrade> {
  const path = findPath(multiTradeRequest.tradeRequest);
  const { tradeRequest } = multiTradeRequest;

  const trades: Trade[] = [];

  if(path.length === 1 && path[0] === TradeType.BITY) {
    const bityTrade = await estimateTrade(tradeRequest);
    trades.push(bityTrade);

  } else if(path.length === 2 && path[0] === TradeType.DEX && path[1] === TradeType.BITY) {
    if(tradeRequest.tradeExact === TradeExact.INPUT) {
      const dexTrade = await estimateTrade({
        inputCurrency: tradeRequest.inputCurrency,
        outputCurrency: ETHER,
        amount: tradeRequest.amount,
        tradeExact: TradeExact.INPUT,
      });

      const bityTrade = await estimateTrade({
        inputCurrency: ETHER,
        outputCurrency: tradeRequest.outputCurrency,
        amount: dexTrade.outputAmount,
        tradeExact: TradeExact.INPUT,
      });

      trades.push(dexTrade);
      trades.push(bityTrade);

    } else if(tradeRequest.tradeExact === TradeExact.OUTPUT) {
      const bityTrade = await estimateTrade({
        inputCurrency: ETHER,
        outputCurrency: tradeRequest.outputCurrency,
        amount: tradeRequest.amount,
        tradeExact: TradeExact.OUTPUT,
      });

      const dexTrade = await estimateTrade({
        inputCurrency: tradeRequest.inputCurrency,
        outputCurrency: ETHER,
        amount: bityTrade.inputAmount,
        tradeExact: TradeExact.OUTPUT,
      });

      trades.push(dexTrade);
      trades.push(bityTrade);

    } else {
      throw new Error('invalid TRADE_EXACT');
    }
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

  const path = findPath(multiTradeRequest.tradeRequest);

  const trades: Trade[] = [];

  if(path.length === 1 && path[0] === TradeType.BITY) {

    const { tradeRequest, bankInfo, ethInfo } = multiTradeRequest;
    const bityTrade = await BityProxy.createOrder(
      tradeRequest, bankInfo, ethInfo, jwsToken
    );
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
