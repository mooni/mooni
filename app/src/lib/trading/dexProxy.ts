import axios from 'axios';
import { ethers, providers, BigNumber } from 'ethers';
import {ParaSwap, APIError} from 'paraswap';

import { CurrencyType, ETHER, Token} from './currencies';
import {amountToDecimal, amountToInt, BN} from '../numbers';
import {DexTrade, TradeExact, TradeRequest, TradeType} from './types';
import { defaultProvider } from '../web3Providers';
import ERC20_ABI from '../abis/ERC20.json';
import AUGUSTUS_ABI from '../abis/augustus.json';
import config from '../../config';

const paraSwap = new ParaSwap().setWeb3Provider(defaultProvider);
const paraswapAxios = axios.create({
  baseURL: 'https://api.paraswap.io/v2',
  timeout: 10000,
});
let paraswapAdapters: any | null = null;

function calculatedGasMargin(gas) {
  const offset = gas.mul(1000).div(10000);
  return gas.add(offset);
}

interface IDexProxy {
  isTokenExchangeable(token: Token): Promise<boolean>;
  getRate(tradeRequest: TradeRequest): Promise<DexTrade>;
  getSpender(dexTrade: DexTrade): Promise<string>;
  getAllowance(tokenAddress: string, senderAddress: string, spenderAddress: string): Promise<string>;
  approve(tokenAddress: string, senderAddress: string, spenderAddress: string, intAmount: string, provider: providers.Web3Provider): Promise<string>;
  checkAndApproveAllowance(dexTrade: DexTrade, provider: providers.Web3Provider): Promise<string | null>;
  executeTrade(dexTrade: DexTrade, provider: providers.Web3Provider): Promise<string>;
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

  async getSpender(_dexTrade: DexTrade): Promise<string> {

    if(!paraswapAdapters) {
      const { data } = await paraswapAxios({
        method: 'get',
        url: `/adapters/${config.chainId}`,
      });
      paraswapAdapters = data;
    }
    const augustusAddress = paraswapAdapters.augustus.exchange;
    const augustusContract = new ethers.Contract(
      augustusAddress,
      AUGUSTUS_ABI,
      defaultProvider
    );

    const spender = await augustusContract.getTokenTransferProxy();
    return spender;
  },

  async getAllowance(tokenAddress: string, senderAddress: string, spenderAddress: string): Promise<string>
  {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, defaultProvider);
    const allowance = await tokenContract.allowance(senderAddress, spenderAddress);
    return allowance.toString();
  },

  async approve(tokenAddress: string, senderAddress: string, spenderAddress: string, intAmount: string, provider: providers.Web3Provider): Promise<string> {
    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    const estimatedGas = await tokenContract.estimateGas.approve(spenderAddress, intAmount);
    const gasLimit = calculatedGasMargin(estimatedGas);
    const tx = await tokenContract.approve(
      spenderAddress,
      BigNumber.from(intAmount),
      {
        gasLimit: BigNumber.from(gasLimit),
      }
    );
    return tx.hash;
  },

  async checkAndApproveAllowance(dexTrade: DexTrade, provider: providers.Web3Provider): Promise<string | null> {
    const signer = provider.getSigner();

    const tokenAddress = (dexTrade.tradeRequest.inputCurrency as Token).address;
    const senderAddress = await signer.getAddress();
    const spenderAddress = await DexProxy.getSpender(dexTrade);
    const intAmount = amountToInt(dexTrade.inputAmount, dexTrade.tradeRequest.inputCurrency.decimals);

    const allowance = await DexProxy.getAllowance(tokenAddress, senderAddress, spenderAddress);
    if(new BN(intAmount).gt(allowance)) {
      const txHash = await DexProxy.approve(tokenAddress, senderAddress, spenderAddress, intAmount, provider);
      return txHash;
    }

    return null;
  },


  async executeTrade(dexTrade: DexTrade, provider: providers.Web3Provider): Promise<string> {
    const { priceRoute } = dexTrade.dexMetadata;

    const signer = provider.getSigner();
    function getTokenAddress(currency) {
      if(currency.equals(ETHER)) {
        return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
      } else if(currency.type === CurrencyType.ERC20) {
        return (currency as Token).address;
      } else {
        throw new Error('impossible token address');
      }
    }
    const srcToken = getTokenAddress(dexTrade.tradeRequest.inputCurrency);
    const destToken = getTokenAddress(dexTrade.tradeRequest.outputCurrency);
    const srcAmount = dexTrade.dexMetadata.priceRoute.srcAmount;
    const destAmount = dexTrade.dexMetadata.priceRoute.destAmount;
    const senderAddress = await signer.getAddress();
    const receiver = undefined;
    const referrer = 'mooni';

    const txParams = await paraSwap.buildTx(srcToken, destToken, srcAmount, destAmount, priceRoute, senderAddress, referrer, receiver);
    if((txParams as APIError).message) throw new Error((txParams as APIError).message);

    const transactionRequest = {
      to: (txParams as any).to,
      from: (txParams as any).from,
      gasLimit: BigNumber.from((txParams as any).gas),
      gasPrice: BigNumber.from((txParams as any).gasPrice),
      data: (txParams as any).data,
      value: BigNumber.from((txParams as any).value),
      chainId: (txParams as any).chainId,
    };

    const tx = await signer.sendTransaction(transactionRequest);
    return tx.hash as string;
  },
};

export default DexProxy;
