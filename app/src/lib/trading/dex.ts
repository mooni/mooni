import { Token } from './currencies';
import { JSBI } from '../numbers';
import {TradeExact, DexTrade, TradeRequest} from './types';

export async function isTokenExchangeable(token: Token) {

}

export async function getRate(tradeRequest: TradeRequest): Promise<DexTrade> {
  const dexTrade: DexTrade = {
    tradeRequest,
    inputAmount: JSBI.BigInt(0),
    outputAmount: JSBI.BigInt(0),
    dexMetadata: {},
  };

  return dexTrade;
}

export async function checkAllowance(tokenA: Token, amount: JSBI) {

}


export async function executeTrade(tokenA: Token, amount: JSBI) {

}
