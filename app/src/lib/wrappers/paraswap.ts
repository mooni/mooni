import axios from 'axios';
import {BigNumber, ethers} from "ethers";
import {APIError, ParaSwap, NetworkID} from 'paraswap';
import { ChainId } from '@uniswap/sdk';

import {defaultProvider} from "../web3Providers";
import { DexTrade, TradeRequest, TradeExact, TradeType } from '../trading/types';
import config from "../../config";
import AUGUSTUS_ABI from "../abis/augustus.json";
import {ETHER} from "../trading/currencyList";
import {
  createFromCurrencyObject,
  CurrencyObject,
  CurrencySymbol,
  CurrencyType,
  TokenCurrency,
  TokenObject,
} from '../trading/currencyTypes';
import {amountToDecimal, amountToInt} from "../numbers";
import { MetaError } from '../errors';
import { applySlippageOnTrade, MAX_SLIPPAGE } from '../trading/dexProxy';

const paraSwapSDK = new ParaSwap(config.chainId as NetworkID).setWeb3Provider(defaultProvider);
const paraswapAxios = axios.create({
  baseURL: `https://apiv2${config.chainId === ChainId.ROPSTEN ? '-ropsten' : ''}.paraswap.io/v2`,
  timeout: 10000,
});
let augustusSpender: string | null = null;

const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

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
  async getRate(tradeRequest: TradeRequest): Promise<DexTrade> {
    const swapSide = tradeRequest.tradeExact === TradeExact.INPUT ? 'SELL' : 'BUY';

    const amountCurrencyObject = tradeRequest.tradeExact === TradeExact.INPUT ? tradeRequest.inputCurrencyObject : tradeRequest.outputCurrencyObject;

    const intAmount = amountToInt(tradeRequest.amount, amountCurrencyObject.decimals);

    try {

      const { data: dexMetadata } = await paraswapAxios({
        method: 'get',
        url: '/prices',
        params: {
          from: tradeRequest.inputCurrencyObject.symbol,
          to: tradeRequest.outputCurrencyObject.symbol,
          amount: intAmount,
          side: swapSide
        },
      });

      const inputAmount = amountToDecimal(
        dexMetadata.priceRoute.srcAmount,
        tradeRequest.inputCurrencyObject.decimals
      );
      const outputAmount = amountToDecimal(
        dexMetadata.priceRoute.destAmount,
        tradeRequest.outputCurrencyObject.decimals
      );

      return {
        tradeRequest,
        inputAmount,
        outputAmount,
        tradeType: TradeType.DEX,
        dexMetadata,
        maxSlippage: MAX_SLIPPAGE,
      };

    } catch(error) {
      const paraswapErrorMessage = error.response?.data?.error;
      if(paraswapErrorMessage) {
        if(paraswapErrorMessage === 'ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT') {
          throw new MetaError('dex-liquidity-error', { value: error.response?.data?.value });
        }
      }
      throw error;
    }
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
  async buildTx(dexTrade: DexTrade, senderAddress: string): Promise<any> {
    function getTokenAddress(currencyObject: CurrencyObject) {
      if(createFromCurrencyObject(currencyObject).equals(ETHER)) {
        return ETH_ADDRESS;
      } else if(currencyObject.type === CurrencyType.ERC20) {
        return (currencyObject as TokenObject).address;
      } else {
        throw new Error('impossible token address');
      }
    }
    const { priceRoute } = dexTrade.dexMetadata;

    const srcToken = getTokenAddress(dexTrade.tradeRequest.inputCurrencyObject);
    const destToken = getTokenAddress(dexTrade.tradeRequest.outputCurrencyObject);
    const { inputAmount, outputAmount } = applySlippageOnTrade(dexTrade);
    const srcAmount = amountToInt(inputAmount, dexTrade.tradeRequest.inputCurrencyObject.decimals);
    const destAmount = amountToInt(outputAmount, dexTrade.tradeRequest.outputCurrencyObject.decimals);
    const receiver = undefined;
    const referrer = 'mooni';

    const txParams = await paraSwapSDK.buildTx(srcToken, destToken, srcAmount, destAmount, priceRoute, senderAddress, referrer, receiver);
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
