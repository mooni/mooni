import {MultiTrade, MultiTradeRequest, Trade, TradePath, TradeRequest, TradeType} from "./types";
import {CurrencyType, ETHER} from './currencies';
import BityProxy from "./bityProxy";
import { TradeExact } from './types';
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
    tradeRequest.outputCurrency.equals(ETHER)
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

async function createTrade(tradeRequest: TradeRequest, multiTradeRequest: MultiTradeRequest, jwsToken): Promise<Trade> {
  const path = findPath(tradeRequest);
  if(path.length !== 1) {
    throw new Error('can only estimate direct trade');
  }
  const tradeType = path[0];
  if(tradeType === TradeType.BITY) {
    if(!multiTradeRequest.bankInfo || !multiTradeRequest.ethInfo) {
      throw new Error('missing bank or eth info on multiTradeRequest');
    }
    return BityProxy.createOrder(tradeRequest, multiTradeRequest.bankInfo, multiTradeRequest.ethInfo, jwsToken);
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
  if (!multiTradeRequest.bankInfo) {
    throw new Error('Bity requires bank info')
  }
  if (!multiTradeRequest.ethInfo) {
    throw new Error('Bity requires eth info')
  }

  const {tradeRequest} = multiTradeRequest;
  const path = findPath(multiTradeRequest.tradeRequest);

  const trades: Trade[] = [];

  if (path.length === 1 && path[0] === TradeType.BITY) {

    const bityTrade = await createTrade(tradeRequest, multiTradeRequest, jwsToken);

    trades.push(bityTrade);

  }
  else if (path.length === 2 && path[0] === TradeType.DEX && path[1] === TradeType.BITY) {

    if (tradeRequest.tradeExact === TradeExact.INPUT) {
      const {outputAmount: ethAmount} = await createTrade({
        inputCurrency: tradeRequest.inputCurrency,
        outputCurrency: ETHER,
        amount: tradeRequest.amount,
        tradeExact: TradeExact.INPUT,
      }, multiTradeRequest, jwsToken);

      const dexTrade = await createTrade({
        inputCurrency: tradeRequest.inputCurrency,
        outputCurrency: ETHER,
        amount: ethAmount,
        tradeExact: TradeExact.OUTPUT,
      }, multiTradeRequest, jwsToken);

      const bityTrade = await createTrade({
        inputCurrency: ETHER,
        outputCurrency: tradeRequest.outputCurrency,
        amount: ethAmount,
        tradeExact: TradeExact.INPUT,
      }, multiTradeRequest, jwsToken);

      trades.push(dexTrade);
      trades.push(bityTrade);

    }
    else if (tradeRequest.tradeExact === TradeExact.OUTPUT) {
      const bityTrade = await createTrade({
        inputCurrency: ETHER,
        outputCurrency: tradeRequest.outputCurrency,
        amount: tradeRequest.amount,
        tradeExact: TradeExact.OUTPUT,
      }, multiTradeRequest, jwsToken);

      const dexTrade = await createTrade({
        inputCurrency: tradeRequest.inputCurrency,
        outputCurrency: ETHER,
        amount: bityTrade.inputAmount,
        tradeExact: TradeExact.OUTPUT,
      }, multiTradeRequest, jwsToken);

      trades.push(dexTrade);
      trades.push(bityTrade);
    }
    else {
      throw new Error('invalid TRADE_EXACT');
    }
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
