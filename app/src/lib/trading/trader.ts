import {CurrencyType} from './currencyTypes';
import {
  MultiTradeEstimation,
  MultiTradeRequest,
  MultiTradeTemp,
  Trade,
  TradePath,
  TradeRequest,
  TradeType,
} from './types';
import {ETHER} from './currencyList';
import { TradeExact } from './types';
import DexProxy from "./dexProxy";
import Bity from "../wrappers/bity";
import CurrenciesManager from './currenciesManager';

export class Trader {
  dexProxy: DexProxy;

  constructor(readonly bityInstance: Bity, readonly currenciesManager: CurrenciesManager) {
    this.dexProxy = new DexProxy(currenciesManager);
  }

  private findPath(tradeRequest: TradeRequest): TradePath {
    const inputCurrency = this.currenciesManager.getCurrency(tradeRequest.inputCurrencyObject.symbol);
    const outputCurrency = this.currenciesManager.getCurrency(tradeRequest.outputCurrencyObject.symbol);
    if(
        inputCurrency.equals(ETHER)
        &&
        outputCurrency.type === CurrencyType.FIAT
    ) {
      return [
        TradeType.BITY,
      ];

    } else if(
        inputCurrency.type === CurrencyType.ERC20
        &&
        outputCurrency.equals(ETHER)
    ) {
      return [
        TradeType.DEX,
      ];

    } else if(
        inputCurrency.type === CurrencyType.ERC20
        &&
        outputCurrency.type === CurrencyType.FIAT
    ) {
      return [
        TradeType.DEX,
        TradeType.BITY,
      ];

    } else {
      throw new Error('Invalid path');
    }
  }

  private async estimateTrade(tradeRequest: TradeRequest): Promise<Trade> {
    const path = this.findPath(tradeRequest);
    if(path.length !== 1) {
      throw new Error('can only estimate direct trade');
    }
    const tradeType = path[0];
    if(tradeType === TradeType.BITY) {
      // console.time('bity_estimate');
      const trade = await this.bityInstance.estimate(tradeRequest);
      // console.timeEnd('bity_estimate');
      return trade;
    }
    else if(tradeType === TradeType.DEX) {
      // console.time('dex_estimate');
      const trade = await this.dexProxy.getRate(tradeRequest);
      // console.timeEnd('dex_estimate');
      return trade;
    } else {
      throw new Error(`Estimation not available for TradeType ${tradeType}'`);
    }
  }

  private async createTrade(tradeRequest: TradeRequest, multiTradeRequest: MultiTradeRequest): Promise<Trade> {
    const path = this.findPath(tradeRequest);
    if(path.length !== 1) {
      throw new Error('can only create direct trade');
    }
    const tradeType = path[0];
    if(tradeType === TradeType.BITY) {
      if(!multiTradeRequest.bankInfo || !multiTradeRequest.ethInfo) {
        throw new Error('missing bank or eth info on multiTradeRequest');
      }
      return await this.bityInstance.createOrder(tradeRequest, multiTradeRequest.bankInfo, multiTradeRequest.ethInfo);
    }
    else if(tradeType === TradeType.DEX) {
      return await this.dexProxy.createTrade(tradeRequest);
    } else {
      throw new Error(`Estimation not available for TradeType ${tradeType}'`);
    }
  }

  async estimateMultiTrade(tradeRequest: TradeRequest): Promise<MultiTradeEstimation> {
    const path = this.findPath(tradeRequest);

    const trades: Trade[] = [];
    let ethAmount: string;

    if(path.length === 1 && path[0] === TradeType.BITY) {

      const bityTrade = await this.estimateTrade(tradeRequest);
      ethAmount = bityTrade.inputAmount;
      trades.push(bityTrade);

    } else if(path.length === 2 && path[0] === TradeType.DEX && path[1] === TradeType.BITY) {
      if(tradeRequest.tradeExact === TradeExact.INPUT) {
        const dexTrade = await this.estimateTrade({
          inputCurrencyObject: tradeRequest.inputCurrencyObject,
          outputCurrencyObject: ETHER.toObject(),
          amount: tradeRequest.amount,
          tradeExact: TradeExact.INPUT,
        });

        const bityTrade = await this.estimateTrade({
          inputCurrencyObject: ETHER.toObject(),
          outputCurrencyObject: tradeRequest.outputCurrencyObject,
          amount: dexTrade.outputAmount,
          tradeExact: TradeExact.INPUT,
        });
        ethAmount = bityTrade.inputAmount;

        trades.push(dexTrade);
        trades.push(bityTrade);

      } else if(tradeRequest.tradeExact === TradeExact.OUTPUT) {
        const bityTrade = await this.estimateTrade({
          inputCurrencyObject: ETHER.toObject(),
          outputCurrencyObject: tradeRequest.outputCurrencyObject,
          amount: tradeRequest.amount,
          tradeExact: TradeExact.OUTPUT,
        });
        ethAmount = bityTrade.inputAmount;

        const dexTrade = await this.estimateTrade({
          inputCurrencyObject: tradeRequest.inputCurrencyObject,
          outputCurrencyObject: ETHER.toObject(),
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
      tradeRequest,
      trades,
      path,
      inputAmount: trades[0].inputAmount,
      outputAmount: trades[trades.length - 1].outputAmount,
      ethAmount,
    };
  }

  async createMultiTrade(multiTradeRequest: MultiTradeRequest): Promise<MultiTradeTemp> {
    if (!multiTradeRequest.bankInfo) {
      throw new Error('Bity requires bank info')
    }
    if (!multiTradeRequest.ethInfo) {
      throw new Error('Bity requires eth info')
    }
    let ethAmount: string;

    const {tradeRequest, ethInfo, bankInfo, referralId} = multiTradeRequest;
    const path = this.findPath(multiTradeRequest.tradeRequest);

    const trades: Trade[] = [];

    if (path.length === 1 && path[0] === TradeType.BITY) {

      const bityTrade = await this.createTrade(tradeRequest, multiTradeRequest);
      ethAmount = bityTrade.inputAmount;

      trades.push(bityTrade);

    }
    else if (path.length === 2 && path[0] === TradeType.DEX && path[1] === TradeType.BITY) {

      if (tradeRequest.tradeExact === TradeExact.INPUT) {
        const {outputAmount: intermediateEthAmount} = await this.createTrade({
          inputCurrencyObject: tradeRequest.inputCurrencyObject,
          outputCurrencyObject: ETHER.toObject(),
          amount: tradeRequest.amount,
          tradeExact: TradeExact.INPUT,
        }, multiTradeRequest);

        const dexTrade = await this.createTrade({
          inputCurrencyObject: tradeRequest.inputCurrencyObject,
          outputCurrencyObject: ETHER.toObject(),
          amount: intermediateEthAmount,
          tradeExact: TradeExact.OUTPUT,
        }, multiTradeRequest);

        const bityTrade = await this.createTrade({
          inputCurrencyObject: ETHER.toObject(),
          outputCurrencyObject: tradeRequest.outputCurrencyObject,
          amount: intermediateEthAmount,
          tradeExact: TradeExact.INPUT,
        }, multiTradeRequest);
        ethAmount = bityTrade.inputAmount;

        trades.push(dexTrade);
        trades.push(bityTrade);

      }
      else if (tradeRequest.tradeExact === TradeExact.OUTPUT) {
        const bityTrade = await this.createTrade({
          inputCurrencyObject: ETHER.toObject(),
          outputCurrencyObject: tradeRequest.outputCurrencyObject,
          amount: tradeRequest.amount,
          tradeExact: TradeExact.OUTPUT,
        }, multiTradeRequest);
        ethAmount = bityTrade.inputAmount;

        const dexTrade = await this.createTrade({
          inputCurrencyObject: tradeRequest.inputCurrencyObject,
          outputCurrencyObject: ETHER.toObject(),
          amount: bityTrade.inputAmount,
          tradeExact: TradeExact.OUTPUT,
        }, multiTradeRequest);

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
      tradeRequest,
      ethInfo,
      bankInfo,
      trades,
      inputAmount: trades[0].inputAmount,
      outputAmount: trades[trades.length - 1].outputAmount,
      path: path,
      ethAmount,
      referralId,
    };
  }
}
