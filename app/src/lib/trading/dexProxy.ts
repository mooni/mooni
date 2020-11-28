import axios from 'axios';
import {Token} from './currencies';
import {amountToDecimal, amountToInt} from '../numbers';
import {DexTrade, TradeExact, TradeRequest, TradeType} from './types';

const paraswapAxios = axios.create({
  baseURL: 'https://api.paraswap.io/v2',
  timeout: 10000,
});

interface IDexProxy {
  isTokenExchangeable(Token): Promise<boolean>;
  getRate(TradeRequest): Promise<DexTrade>;
  checkAllowance(DexTrade, any): Promise<TX | null>;
  executeTrade(DexTrade, any): Promise<TX>;
}

interface TX {
  hash: string;
}

const DexProxy: IDexProxy = {
  // TODO when add new token
  async isTokenExchangeable(token: Token) {
    return true;
  },

  async getRate(tradeRequest: TradeRequest): Promise<DexTrade> {
    const swapSide = tradeRequest.tradeExact === TradeExact.INPUT ? 'SELL' : 'BUY';
    const amountCurrency = tradeRequest.tradeExact === TradeExact.INPUT ? tradeRequest.inputCurrency : tradeRequest.outputCurrency;
    const intAmount = amountToInt(tradeRequest.amount, amountCurrency.decimals);

    const { data } = await paraswapAxios({
      method: 'get',
      url: '/prices',
      params: {
        from: tradeRequest.inputCurrency.symbol,
        to: tradeRequest.outputCurrency.symbol,
        amount: intAmount,
        side: swapSide
      },
    });

    const inputAmount = amountToDecimal(data.priceRoute.srcAmount, tradeRequest.inputCurrency.decimals);
    const outputAmount = amountToDecimal(data.priceRoute.destAmount, tradeRequest.outputCurrency.decimals);

    return {
      tradeRequest,
      inputAmount,
      outputAmount,
      tradeType: TradeType.DEX,
      dexMetadata: data,
    };
  },

  async checkAllowance(dexTrade: DexTrade, signer): Promise<TX | null> {
    //TODO
    return {hash: 'XX'};
  },


  async executeTrade(dexTrade: DexTrade, signer): Promise<TX> {
    //TODO
    return {hash: 'XX'};
  },
};

export default DexProxy;
