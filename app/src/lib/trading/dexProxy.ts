import { ethers, providers, BigNumber } from 'ethers';
import { MaxUint256 } from '@ethersproject/constants'

import { CurrencySymbol, CurrencyType, TokenCurrency, TokenObject } from './currencyTypes';
import { amountToDecimal, amountToInt, BN } from '../numbers';
import { DexTrade, TradeExact, TradeRequest } from './types';
import { defaultProvider } from '../web3Providers';
import ERC20_ABI from '../abis/ERC20.json';
import Paraswap from '../wrappers/paraswap';

// Add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

export const MAX_SLIPPAGE = 0.01;

export function applySlippage(amount: string, maxSlippage: number = MAX_SLIPPAGE): string {
  const slippageMultiply = new BN(1).plus(maxSlippage);
  let withSlippage = new BN(amount).times(slippageMultiply);
  withSlippage = withSlippage.dp(0, maxSlippage > 0 ? BN.ROUND_CEIL : BN.ROUND_FLOOR);
  return withSlippage.toFixed();
}

interface TradeSlippage {
  inputAmount: string,
  outputAmount: string,
  maxInputAmount: string,
  minOutputAmount: string,
}

export function applySlippageOnTrade(dexTrade: DexTrade): TradeSlippage {
  const {
    maxSlippage,
    inputAmount,
    outputAmount,
    tradeRequest: { tradeExact, inputCurrencyObject, outputCurrencyObject}
  } = dexTrade;

  function applyWithDecimals(a , d, s) {
    const intAmount = amountToInt(a, d);
    const intWithSlippage = applySlippage(intAmount, s);
    return amountToDecimal(intWithSlippage, d);
  }

  const maxInputAmount = applyWithDecimals(inputAmount, inputCurrencyObject.decimals, maxSlippage);
  const minOutputAmount = applyWithDecimals(outputAmount, outputCurrencyObject.decimals, -maxSlippage);

  return {
    inputAmount: tradeExact === TradeExact.OUTPUT ? maxInputAmount : inputAmount,
    outputAmount: tradeExact === TradeExact.INPUT ? minOutputAmount : outputAmount,
    maxInputAmount,
    minOutputAmount,
  }
}


const DexProxy = {

  async getTokenFromAddress(tokenAddress: string): Promise<TokenCurrency | null> {
    const tokens = await Paraswap.getTokenList();
    const foundToken = tokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    return foundToken || null;
  },

  async getTokenFromSymbol(tokenSymbol: CurrencySymbol): Promise<TokenCurrency | null> {
    const tokens = await Paraswap.getTokenList();
    const foundToken = tokens.find(t => t.symbol === tokenSymbol);
    return foundToken || null;
  },

  async getRate(tradeRequest: TradeRequest): Promise<DexTrade> {
    return Paraswap.getRate(tradeRequest);
  },

  async createTrade(tradeRequest: TradeRequest): Promise<DexTrade> {
    return DexProxy.getRate(tradeRequest);
  },

  async getSpender(_: string): Promise<string> {
    return Paraswap.getSpender();
  },

  async getAllowance(tokenObject: TokenObject, senderAddress: string, spenderAddress: string): Promise<string>
  {
    const tokenContract = new ethers.Contract(tokenObject.address, ERC20_ABI, defaultProvider);
    const allowance = await tokenContract.allowance(senderAddress, spenderAddress);
    return amountToDecimal(allowance.toString(), tokenObject.decimals);
  },

  async approve(tokenObject: TokenObject, senderAddress: string, spenderAddress: string, amount: string, provider: providers.Web3Provider): Promise<string> {
    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(tokenObject.address, ERC20_ABI, signer);

    const intAmount = BigNumber.from(amountToInt(amount, tokenObject.decimals));

    // let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(spenderAddress, MaxUint256).catch(() => {
      // general fallback for tokens who restrict approval amounts
      // useExact = true;
      return tokenContract.estimateGas.approve(spenderAddress, intAmount);
    });

    const tx = await tokenContract.approve(
      spenderAddress,
      intAmount,
      {
        gasLimit: calculateGasMargin(estimatedGas),
      }
    );
    return tx.hash;
  },

  async checkAndApproveAllowance(dexTrade: DexTrade, provider: providers.Web3Provider): Promise<string | null> {
    const signer = provider.getSigner();

    const inputCurrencyObject = dexTrade.tradeRequest.inputCurrencyObject;
    if(inputCurrencyObject.type !== CurrencyType.ERC20) {
      throw new Error('tried to check allowance of non-erc20 currency');
    }
    const inputTokenObject = inputCurrencyObject as TokenObject;
    const senderAddress = await signer.getAddress();
    const spenderAddress = await DexProxy.getSpender(dexTrade.tradeRequest.inputCurrencyObject.symbol);

    const { maxInputAmount } = applySlippageOnTrade(dexTrade);

    const allowance = await DexProxy.getAllowance(inputTokenObject, senderAddress, spenderAddress);
    if(new BN(maxInputAmount).gt(allowance)) {
      const txHash = await DexProxy.approve(inputTokenObject, senderAddress, spenderAddress, maxInputAmount, provider);
      return txHash;
    }

    return null;
  },

  async executeTrade(dexTrade: DexTrade, provider: providers.Web3Provider): Promise<string> {
    const signer = provider.getSigner();
    const senderAddress = await signer.getAddress();
    const transactionRequest = await Paraswap.buildTx(dexTrade, senderAddress);
    const tx = await signer.sendTransaction(transactionRequest);
    return tx.hash as string;
  },

}

export default DexProxy;
