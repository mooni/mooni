import axios from 'axios';
import {BigNumber, ethers} from "ethers";
import {APIError, ParaSwap, NetworkID} from 'paraswap';
import { ChainId } from '@uniswap/sdk';

import {defaultProvider} from "../web3Providers";
import { CurrencySymbol, DexTrade, TradeExact, TradeRequest, TradeType } from '../trading/types';
import config from "../../config";
import AUGUSTUS_ABI from "../abis/augustus.json";
import {ETHER} from "../trading/currencyList";
import { CurrencyType, TokenCurrency } from '../trading/currencyTypes';
import {amountToDecimal, amountToInt, BN} from "../numbers";
import CurrenciesManager from '../trading/currenciesManager';
import { MetaError } from '../errors';

const paraSwap = new ParaSwap(config.chainId as NetworkID).setWeb3Provider(defaultProvider);
const paraswapAxios = axios.create({
  baseURL: `https://api${config.chainId === ChainId.ROPSTEN ? '-ropsten' : ''}.paraswap.io/v2`,
  timeout: 10000,
});
let augustusSpender: string | null = null;

const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

function applySlippage(amount: string, maxSlippage: number): string {
  return new BN(amount).times(new BN(1).plus(maxSlippage)).toFixed();
}

export interface CurrencyBalance {
  symbol: CurrencySymbol,
  balance: string,
  allowance: string,
}
export type CurrencyBalances = Record<string, CurrencyBalance>;

const ParaswapWrapper = {
  async getTokenList(): Promise<TokenCurrency[]> {
    const { data } = await paraswapAxios({
      method: 'get',
      url: `/tokens/${config.chainId}`,
    });
    return data.tokens.map(t =>
      t.address.toLowerCase() === ETH_ADDRESS ?
        ETHER
        :
        new TokenCurrency(t.decimals, t.address, config.chainId, t.symbol, undefined, t.img)
    );
  },
  async getBalances(address: string): Promise<CurrencyBalances> {
    const { data } = await paraswapAxios({
      method: 'get',
      url: `/users/tokens/${config.chainId}/${address}`,
    });
    return data.tokens.reduce((acc, token) => ({
      ...acc,
      [token.symbol]: {
        symbol: token.symbol,
        balance: token.balance,
        allowance: token.allowance,
      }
    }), {});
  },
  async getRate(tradeRequest: TradeRequest, currenciesManager: CurrenciesManager): Promise<DexTrade> {
    const swapSide = tradeRequest.tradeExact === TradeExact.INPUT ? 'SELL' : 'BUY';

    const inputCurrency = currenciesManager.getCurrency(tradeRequest.inputCurrencySymbol);
    const outputCurrency = currenciesManager.getCurrency(tradeRequest.outputCurrencySymbol);
    const amountCurrency = tradeRequest.tradeExact === TradeExact.INPUT ? inputCurrency : outputCurrency;

    const intAmount = amountToInt(tradeRequest.amount, amountCurrency.decimals);

    try {

    } catch(error) {
      const paraswapErrorMessage = error.response?.data?.error;
      if(paraswapErrorMessage) {
        if(paraswapErrorMessage === 'ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT') {
          throw new MetaError('dex-liquidity-error', { value: error.response?.data?.value });
        }
      }
      throw error;
    }
    const { data: dexMetadata } = await paraswapAxios({
      method: 'get',
      url: '/prices',
      params: {
        from: tradeRequest.inputCurrencySymbol,
        to: tradeRequest.outputCurrencySymbol,
        amount: intAmount,
        side: swapSide
      },
    });

    const inputAmount = amountToDecimal(dexMetadata.priceRoute.srcAmount, inputCurrency.decimals);
    const outputAmount = amountToDecimal(dexMetadata.priceRoute.destAmount, outputCurrency.decimals);

    return {
      tradeRequest,
      inputAmount,
      outputAmount,
      tradeType: TradeType.DEX,
      dexMetadata,
    };
  },
  async getSpender(): Promise<string> {
    if(!augustusSpender) {
      const { data: paraswapAdapters } = await paraswapAxios({
        method: 'get',
        url: `/adapters/${config.chainId}`,
      });
      const augustusAddress = paraswapAdapters.augustus.exchange;
      const augustusContract = new ethers.Contract(
        augustusAddress,
        AUGUSTUS_ABI,
        defaultProvider
      );

      augustusSpender = await augustusContract.getTokenTransferProxy() as string;
    }
    return augustusSpender;
  },
  async buildTx(dexTrade: DexTrade, senderAddress: string, maxSlippage: number, currenciesManager: CurrenciesManager): Promise<any> {
    function getTokenAddress(symbol) {
      const currency = currenciesManager.getCurrency(symbol);

      if(currency.equals(ETHER)) {
        return ETH_ADDRESS;
      } else if(currency.type === CurrencyType.ERC20) {
        return (currency as TokenCurrency).address;
      } else {
        throw new Error('impossible token address');
      }
    }
    const { priceRoute } = dexTrade.dexMetadata;

    const srcToken = getTokenAddress(dexTrade.tradeRequest.inputCurrencySymbol);
    const destToken = getTokenAddress(dexTrade.tradeRequest.outputCurrencySymbol);
    const srcAmount = applySlippage(dexTrade.dexMetadata.priceRoute.srcAmount, dexTrade.tradeRequest.tradeExact === TradeExact.INPUT ? 0 : maxSlippage);
    const destAmount = applySlippage(dexTrade.dexMetadata.priceRoute.destAmount, dexTrade.tradeRequest.tradeExact === TradeExact.OUTPUT ? 0 : -maxSlippage);
    const receiver = undefined;
    const referrer = 'mooni';

    const txParams = await paraSwap.buildTx(srcToken, destToken, srcAmount, destAmount, priceRoute, senderAddress, referrer, receiver);
    if((txParams as APIError).message) throw new Error((txParams as APIError).message);

    return {
      to: (txParams as any).to,
      from: (txParams as any).from,
      gasLimit: BigNumber.from((txParams as any).gas),
      gasPrice: BigNumber.from((txParams as any).gasPrice),
      data: (txParams as any).data,
      value: BigNumber.from((txParams as any).value),
      chainId: (txParams as any).chainId,
    };
  }
};

export default ParaswapWrapper;
