import { ethers, providers, BigNumber } from 'ethers';

import { TokenCurrency } from './currencyTypes';
import { amountToDecimal, amountToInt, BN } from '../numbers';
import {CurrencySymbol, DexTrade, TradeRequest} from './types';
import { defaultProvider } from '../web3Providers';
import ERC20_ABI from '../abis/ERC20.json';
import Paraswap from '../wrappers/paraswap';
import CurrenciesManager from './currenciesManager';

function calculatedGasMargin(gas) {
  const offset = gas.mul(1000).div(10000);
  return gas.add(offset);
}

class DexProxy {
  constructor(readonly currenciesManager: CurrenciesManager) {}

  static async getTokenFromAddress(tokenAddress: string): Promise<TokenCurrency | null> {
    const tokens = await Paraswap.getTokenList();
    const foundToken = tokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    return foundToken || null;
  }

  static async getTokenFromSymbol(tokenSymbol: CurrencySymbol): Promise<TokenCurrency | null> {
    const tokens = await Paraswap.getTokenList();
    const foundToken = tokens.find(t => t.symbol === tokenSymbol);
    return foundToken || null;
  }

  async getRate(tradeRequest: TradeRequest): Promise<DexTrade> {
    return Paraswap.getRate(tradeRequest, this.currenciesManager);
  }

  async createTrade(tradeRequest: TradeRequest): Promise<DexTrade> {
    return this.getRate(tradeRequest);
  }

  static async getSpender(_: string): Promise<string> {
    return Paraswap.getSpender();
  }

  static async getAllowance(token: TokenCurrency, senderAddress: string, spenderAddress: string): Promise<string>
  {
    const tokenContract = new ethers.Contract(token.address, ERC20_ABI, defaultProvider);
    const allowance = await tokenContract.allowance(senderAddress, spenderAddress);
    return amountToDecimal(allowance.toString(), token.decimals);
  }

  static async approve(token: TokenCurrency, senderAddress: string, spenderAddress: string, amount: string, provider: providers.Web3Provider): Promise<string> {
    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);

    const intAmount = BigNumber.from(amountToInt(amount, token.decimals));

    const estimatedGas = await tokenContract.estimateGas.approve(spenderAddress, intAmount);
    const gasLimit = calculatedGasMargin(estimatedGas);

    const tx = await tokenContract.approve(
      spenderAddress,
      intAmount,
      {
        gasLimit: BigNumber.from(gasLimit),
      }
    );
    return tx.hash;
  }

  async checkAndApproveAllowance(dexTrade: DexTrade, provider: providers.Web3Provider): Promise<string | null> {
    const signer = provider.getSigner();

    const inputToken = this.currenciesManager.getCurrency(dexTrade.tradeRequest.inputCurrencySymbol) as TokenCurrency;
    const senderAddress = await signer.getAddress();
    const spenderAddress = await DexProxy.getSpender(dexTrade.tradeRequest.inputCurrencySymbol);

    const allowance = await DexProxy.getAllowance(inputToken, senderAddress, spenderAddress);
    if(new BN(dexTrade.inputAmount).gt(allowance)) {
      const txHash = await DexProxy.approve(inputToken, senderAddress, spenderAddress, dexTrade.inputAmount, provider);
      return txHash;
    }

    return null;
  }

  async executeTrade(dexTrade: DexTrade, provider: providers.Web3Provider, maxSlippage: number): Promise<string> {
    const signer = provider.getSigner();
    const senderAddress = await signer.getAddress();
    const transactionRequest = await Paraswap.buildTx(dexTrade, senderAddress, maxSlippage, this.currenciesManager);
    const tx = await signer.sendTransaction(transactionRequest);
    return tx.hash as string;
  }
}

export default DexProxy;
