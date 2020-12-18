import { ethers, providers, BigNumber } from 'ethers';

import { TokenCurrency} from './currencyTypes';
import {amountToInt, BN} from '../numbers';
import {CurrencySymbol, DexTrade, TradeRequest} from './types';
import { defaultProvider } from '../web3Providers';
import ERC20_ABI from '../abis/ERC20.json';
import Paraswap from '../wrappers/paraswap';
import {getCurrency} from "./currencyHelpers";

function calculatedGasMargin(gas) {
  const offset = gas.mul(1000).div(10000);
  return gas.add(offset);
}

interface IDexProxy {
  getTokenFromAddress(tokenAddress: string): Promise<TokenCurrency | null>;
  getTokenFromSymbol(tokenSymbol: CurrencySymbol): Promise<TokenCurrency | null>;
  getRate(tradeRequest: TradeRequest): Promise<DexTrade>;
  createTrade(tradeRequest: TradeRequest): Promise<DexTrade>;
  getSpender(dexTrade: DexTrade): Promise<string>;
  getAllowance(tokenAddress: string, senderAddress: string, spenderAddress: string): Promise<string>;
  approve(tokenAddress: string, senderAddress: string, spenderAddress: string, intAmount: string, provider: providers.Web3Provider): Promise<string>;
  checkAndApproveAllowance(dexTrade: DexTrade, provider: providers.Web3Provider): Promise<string | null>;
  executeTrade(dexTrade: DexTrade, provider: providers.Web3Provider, maxSlippage: number): Promise<string>;
}

const DexProxy: IDexProxy = {
  async getTokenFromAddress(tokenAddress: string): Promise<TokenCurrency | null> {
    const tokens = await Paraswap.getTokenList();
    const foundToken = tokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    return foundToken || null;
  },

  async getTokenFromSymbol(tokenSymbol: CurrencySymbol): Promise<TokenCurrency | null> {
    const tokens = await Paraswap.getTokenList();
    const foundToken = tokens.find(t => t.symbol === tokenSymbol);
    return foundToken || null;
  },

  async getRate(tradeRequest: TradeRequest): Promise<DexTrade> {
    return Paraswap.getRate(tradeRequest);
  },

  async createTrade(tradeRequest: TradeRequest): Promise<DexTrade> {
    return Paraswap.getRate(tradeRequest);
  },

  async getSpender(_dexTrade: DexTrade): Promise<string> {
    return Paraswap.getSpender();
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

    const inputToken = getCurrency(dexTrade.tradeRequest.inputCurrencySymbol) as TokenCurrency;
    const senderAddress = await signer.getAddress();
    const spenderAddress = await DexProxy.getSpender(dexTrade);
    const intAmount = amountToInt(dexTrade.inputAmount, inputToken.decimals);

    const allowance = await DexProxy.getAllowance(inputToken.address, senderAddress, spenderAddress);
    if(new BN(intAmount).gt(allowance)) {
      const txHash = await DexProxy.approve(inputToken.address, senderAddress, spenderAddress, intAmount, provider);
      return txHash;
    }

    return null;
  },


  async executeTrade(dexTrade: DexTrade, provider: providers.Web3Provider, maxSlippage: number): Promise<string> {
    const signer = provider.getSigner();
    const senderAddress = await signer.getAddress();
    const transactionRequest = await Paraswap.buildTx(dexTrade, senderAddress, maxSlippage);
    const tx = await signer.sendTransaction(transactionRequest);
    return tx.hash as string;
  },
};

export default DexProxy;
