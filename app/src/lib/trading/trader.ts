import {MultiTrade, MultiTradeEstimation, MultiTradeRequest, Trade, TradePath, TradeRequest, TradeType} from "./types";
import {CurrencyType} from './currencyTypes';
import {ETHER} from './currencyList';
import { TradeExact } from './types';
import DexProxy from "./dexProxy";
import Bity from "../wrappers/bity";
import {addTokenFromSymbol, getCurrency} from "./currencyHelpers";

export class Trader {
  constructor(readonly bityInstance: Bity) {}

  private static findPath(tradeRequest: TradeRequest): TradePath {
    const inputCurrency = getCurrency(tradeRequest.inputCurrencySymbol)
    const outputCurrency = getCurrency(tradeRequest.outputCurrencySymbol)
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
    const path = Trader.findPath(tradeRequest);
    if(path.length !== 1) {
      throw new Error('can only estimate direct trade');
    }
    const tradeType = path[0];
    if(tradeType === TradeType.BITY) {
      return await this.bityInstance.estimate(tradeRequest);
    }
    else if(tradeType === TradeType.DEX) {
      return await DexProxy.getRate(tradeRequest);
    } else {
      throw new Error(`Estimation not available for TradeType ${tradeType}'`);
    }
  }

  private async createTrade(tradeRequest: TradeRequest, multiTradeRequest: MultiTradeRequest): Promise<Trade> {
    const path = Trader.findPath(tradeRequest);
    if(path.length !== 1) {
      throw new Error('can only estimate direct trade');
    }
    const tradeType = path[0];
    if(tradeType === TradeType.BITY) {
      if(!multiTradeRequest.bankInfo || !multiTradeRequest.ethInfo) {
        throw new Error('missing bank or eth info on multiTradeRequest');
      }
      return await this.bityInstance.createOrder(tradeRequest, multiTradeRequest.bankInfo, multiTradeRequest.ethInfo);
    }
    else if(tradeType === TradeType.DEX) {
      return await DexProxy.createTrade(tradeRequest);
    } else {
      throw new Error(`Estimation not available for TradeType ${tradeType}'`);
    }
  }

  async estimateMultiTrade(tradeRequest: TradeRequest): Promise<MultiTradeEstimation> {
    const path = Trader.findPath(tradeRequest);

    const trades: Trade[] = [];
    let ethAmount: string;

    if(path.length === 1 && path[0] === TradeType.BITY) {

      const bityTrade = await this.estimateTrade(tradeRequest);
      ethAmount = bityTrade.inputAmount;
      trades.push(bityTrade);

    } else if(path.length === 2 && path[0] === TradeType.DEX && path[1] === TradeType.BITY) {
      if(tradeRequest.tradeExact === TradeExact.INPUT) {
        const dexTrade = await this.estimateTrade({
          inputCurrencySymbol: tradeRequest.inputCurrencySymbol,
          outputCurrencySymbol: ETHER.symbol,
          amount: tradeRequest.amount,
          tradeExact: TradeExact.INPUT,
        });

        const bityTrade = await this.estimateTrade({
          inputCurrencySymbol: ETHER.symbol,
          outputCurrencySymbol: tradeRequest.outputCurrencySymbol,
          amount: dexTrade.outputAmount,
          tradeExact: TradeExact.INPUT,
        });
        ethAmount = bityTrade.inputAmount;

        trades.push(dexTrade);
        trades.push(bityTrade);

      } else if(tradeRequest.tradeExact === TradeExact.OUTPUT) {
        const bityTrade = await this.estimateTrade({
          inputCurrencySymbol: ETHER.symbol,
          outputCurrencySymbol: tradeRequest.outputCurrencySymbol,
          amount: tradeRequest.amount,
          tradeExact: TradeExact.OUTPUT,
        });
        ethAmount = bityTrade.inputAmount;

        const dexTrade = await this.estimateTrade({
          inputCurrencySymbol: tradeRequest.inputCurrencySymbol,
          outputCurrencySymbol: ETHER.symbol,
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

  async createMultiTrade(multiTradeRequest: MultiTradeRequest): Promise<MultiTrade> {
    if (!multiTradeRequest.bankInfo) {
      throw new Error('Bity requires bank info')
    }
    if (!multiTradeRequest.ethInfo) {
      throw new Error('Bity requires eth info')
    }
    let ethAmount: string;

    const {tradeRequest, ethInfo, bankInfo, referralId} = multiTradeRequest;
    const path = Trader.findPath(multiTradeRequest.tradeRequest);

    const trades: Trade[] = [];

    if (path.length === 1 && path[0] === TradeType.BITY) {

      const bityTrade = await this.createTrade(tradeRequest, multiTradeRequest);
      ethAmount = bityTrade.inputAmount;

      trades.push(bityTrade);

    }
    else if (path.length === 2 && path[0] === TradeType.DEX && path[1] === TradeType.BITY) {

      if (tradeRequest.tradeExact === TradeExact.INPUT) {
        const {outputAmount: intermediateEthAmount} = await this.createTrade({
          inputCurrencySymbol: tradeRequest.inputCurrencySymbol,
          outputCurrencySymbol: ETHER.symbol,
          amount: tradeRequest.amount,
          tradeExact: TradeExact.INPUT,
        }, multiTradeRequest);

        const dexTrade = await this.createTrade({
          inputCurrencySymbol: tradeRequest.inputCurrencySymbol,
          outputCurrencySymbol: ETHER.symbol,
          amount: intermediateEthAmount,
          tradeExact: TradeExact.OUTPUT,
        }, multiTradeRequest);

        const bityTrade = await this.createTrade({
          inputCurrencySymbol: ETHER.symbol,
          outputCurrencySymbol: tradeRequest.outputCurrencySymbol,
          amount: intermediateEthAmount,
          tradeExact: TradeExact.INPUT,
        }, multiTradeRequest);
        ethAmount = bityTrade.inputAmount;

        trades.push(dexTrade);
        trades.push(bityTrade);

      }
      else if (tradeRequest.tradeExact === TradeExact.OUTPUT) {
        const bityTrade = await this.createTrade({
          inputCurrencySymbol: ETHER.symbol,
          outputCurrencySymbol: tradeRequest.outputCurrencySymbol,
          amount: tradeRequest.amount,
          tradeExact: TradeExact.OUTPUT,
        }, multiTradeRequest);
        ethAmount = bityTrade.inputAmount;

        const dexTrade = await this.createTrade({
          inputCurrencySymbol: tradeRequest.inputCurrencySymbol,
          outputCurrencySymbol: ETHER.symbol,
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

  static async assertTokenReady(tradeRequest: TradeRequest) {
    const inputSymbol = tradeRequest.inputCurrencySymbol;
    await addTokenFromSymbol(inputSymbol);
  }
}
