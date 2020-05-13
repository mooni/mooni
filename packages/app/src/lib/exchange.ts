import BN from 'bignumber.js';
import {
  ETH,
  EXCHANGE_ABI,
  getExecutionDetails,
  getTokenReserves,
  TRADE_METHODS,
  tradeExactTokensForEthWithData,
  tradeTokensForExactEthWithData,
} from '@uniswap/sdk';
import {ethers} from 'ethers';

import ERC20_ABI from './abis/ERC20.json';
import { getTokenAddress } from './currencies';
import Bity from './bity';

import {DexTrade, ExchangePath, Order, OrderRequest, RateRequest, RateResult, TradeExact} from './types';
import {defaultProvider} from './web3Providers';

const stringifyObj = obj => JSON.parse(JSON.stringify(obj));

// TODO slippage

function calculatedGasMargin(gas) {
  const offset = gas.mul(1000).div(10000);
  return gas.add(offset);
}

export async function getRate(rateRequest: RateRequest): Promise<RateResult> {
  const rateResult: RateResult = {
    inputCurrency: rateRequest.inputCurrency,
    outputCurrency: rateRequest.outputCurrency,
    tradeExact: rateRequest.tradeExact,
    inputAmount: '',
    outputAmount: '',
  };

  if(rateRequest.tradeExact === TradeExact.INPUT) {

    let ethInputAmount = rateRequest.amount;

    if(rateRequest.inputCurrency !== ETH) {
      const tokenRate = await rateTokenToETH({
        symbol: rateRequest.inputCurrency,
        amount: rateRequest.amount,
        tradeExact: TradeExact.INPUT,
      });
      ethInputAmount = tokenRate.outputAmount;
    }

    const bityRate = await Bity.estimate({
      inputCurrency: ETH,
      outputCurrency: rateRequest.outputCurrency,
      amount: ethInputAmount,
      tradeExact: TradeExact.INPUT
    });

    rateResult.inputAmount = new BN(rateRequest.amount).toFixed();
    rateResult.outputAmount = new BN(bityRate.outputAmount).toFixed();
    rateResult.fees = bityRate.fees;

  } else if(rateRequest.tradeExact === TradeExact.OUTPUT) {

    const bityRate = await Bity.estimate({
      inputCurrency: ETH,
      outputCurrency: rateRequest.outputCurrency,
      amount: rateRequest.amount,
      tradeExact: TradeExact.OUTPUT
    });

    let finalInputAmount = bityRate.inputAmount;

    if(rateRequest.inputCurrency !== ETH) {
      const tokenRate = await rateTokenToETH({
        symbol: rateRequest.inputCurrency,
        amount: bityRate.inputAmount,
        tradeExact: TradeExact.OUTPUT,
      });
      finalInputAmount = tokenRate.inputAmount;
    }

    rateResult.inputAmount = new BN(finalInputAmount).toFixed();
    rateResult.outputAmount = new BN(rateRequest.amount).toFixed();
    rateResult.fees = bityRate.fees;

  } else {
    throw new Error('invalid TRADE_EXACT');
  }

  return rateResult;
}

export async function createOrder(orderRequest: OrderRequest, fromAddress: string): Promise<Order> {

  if(orderRequest.rateRequest.inputCurrency === ETH) {

    const bityOrder = await Bity.order(
      {
        recipient: orderRequest.recipient,
        rateRequest: orderRequest.rateRequest,
        reference: orderRequest.reference,
      },
      fromAddress
    );

    return {
      orderRequest,
      estimatedRates: {
        inputAmount: bityOrder.input.amount,
        inputCurrency: orderRequest.rateRequest.inputCurrency,
        outputAmount: bityOrder.output.amount,
        outputCurrency: orderRequest.rateRequest.outputCurrency,
      },
      bityOrder,
      path: ExchangePath.BITY,
    };

  } else {

    if(orderRequest.rateRequest.tradeExact === TradeExact.INPUT) {

      const { outputAmount: ethAmount } = await rateTokenToETH({
        symbol: orderRequest.rateRequest.inputCurrency,
        amount: orderRequest.rateRequest.amount,
        tradeExact: TradeExact.INPUT,
      });

      const { inputAmount: estimatedInput, tradeDetails } = await rateTokenToETH({
        symbol: orderRequest.rateRequest.inputCurrency,
        amount: ethAmount,
        tradeExact: TradeExact.OUTPUT,
      });

      const bityOrder = await Bity.order(
        {
          recipient: orderRequest.recipient,
          rateRequest: {
            inputCurrency: ETH,
            outputCurrency: orderRequest.rateRequest.outputCurrency,
            amount: ethAmount,
            tradeExact: TradeExact.INPUT,
          },
          reference: orderRequest.reference,
        },
        fromAddress
      );

      return {
        orderRequest,
        estimatedRates: {
          inputAmount: estimatedInput,
          inputCurrency: orderRequest.rateRequest.inputCurrency,
          outputAmount: bityOrder.output.amount,
          outputCurrency: orderRequest.rateRequest.outputCurrency,
        },
        bityOrder,
        path: ExchangePath.DEX_BITY,
        tradeData: {
          tradeDetails,
        }
      };

    } else {

      const bityOrder = await Bity.order(
        {
          recipient: orderRequest.recipient,
          rateRequest: {
            inputCurrency: ETH,
            outputCurrency: orderRequest.rateRequest.outputCurrency,
            amount: orderRequest.rateRequest.amount,
            tradeExact: TradeExact.OUTPUT,
          },
          reference: orderRequest.reference,
        },
        fromAddress
      );

      const { inputAmount: estimatedInput, tradeDetails } = await rateTokenToETH({
        symbol: orderRequest.rateRequest.inputCurrency,
        amount: bityOrder.input.amount,
        tradeExact: TradeExact.OUTPUT,
      });

      return {
        orderRequest,
        estimatedRates: {
          inputAmount: estimatedInput,
          inputCurrency: orderRequest.rateRequest.inputCurrency,
          outputAmount: bityOrder.output.amount,
          outputCurrency: orderRequest.rateRequest.outputCurrency,
        },
        bityOrder,
        path: ExchangePath.DEX_BITY,
        tradeData: {
          tradeDetails,
        }
      };

    }

  }

}


export async function rateTokenToETH({ symbol, amount, tradeExact }: { symbol: string, amount: string, tradeExact: TradeExact }): Promise<DexTrade> {
  const tokenAddress = getTokenAddress(symbol);
  const tokenReserves = await getTokenReserves(tokenAddress, defaultProvider);

  const decimals = tradeExact === TradeExact.OUTPUT ? 18 : tokenReserves.token.decimals;
  const exactAmount = new BN(amount).times(10 ** decimals).dp(0);

  const method = (
    (tradeExact === TradeExact.INPUT && tradeExactTokensForEthWithData) ||
    (tradeExact === TradeExact.OUTPUT && tradeTokensForExactEthWithData)
  );
  if(!method) throw new Error('invalid tradeExact');

  const tradeDetails = await method(tokenReserves, exactAmount);
  const serializedResponse = stringifyObj(tradeDetails);

  return {
    inputAmount: tradeDetails.inputAmount.amount.div(10 ** tradeDetails.inputAmount.token.decimals).toFixed(),
    outputAmount: tradeDetails.outputAmount.amount.div(10 ** tradeDetails.outputAmount.token.decimals).toFixed(),
    inputCurrency: symbol,
    outputCurrency: ETH,
    tradeExact,
    rate: serializedResponse.executionRate.rate,
    invertedRate: serializedResponse.executionRate.rateInverted,
    tradeDetails,
  }
}

export async function checkTradeAllowance(tradeDetails, signer) {
  const executionDetails = getExecutionDetails(tradeDetails);

  const tokenAddress = tradeDetails.inputAmount.token.address;
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

  const senderAddress = await signer.getAddress();
  const tokenBalance = await tokenContract.balanceOf(senderAddress);
  if(tradeDetails.inputAmount.amount.gt(tokenBalance)) {
    throw new Error('token-balance-too-low');
  }

  const allowance = await tokenContract.allowance(senderAddress, executionDetails.exchangeAddress);

  if(tradeDetails.inputAmount.amount.gt(allowance)) {
    const allowanceAmount = tradeDetails.inputAmount.amount.toFixed();
    const estimatedGas = await tokenContract.estimate.approve(executionDetails.exchangeAddress, allowanceAmount);
    const gasLimit = calculatedGasMargin(estimatedGas);
    return tokenContract.approve(
      executionDetails.exchangeAddress,
      allowanceAmount,
      {
        gasLimit,
      }
    );
  }
  return null;
}

export async function executeTrade(tradeDetails: any, recipient: string | undefined, signer: any) {
  const executionDetails = getExecutionDetails(
    tradeDetails,
    undefined, // max slippage, default 200 (2%)
    undefined, // deadline, default 10 minutes
    recipient,
  );

  const exchangeContract = new ethers.Contract(executionDetails.exchangeAddress, EXCHANGE_ABI, signer);

  const tradeMethod = TRADE_METHODS[executionDetails.methodName];
  const args = executionDetails.methodArguments.map(n => new BN(n).toFixed());

  const overrides: any = {
    value: ethers.utils.parseEther(executionDetails.value.toFixed()),
  };

  const estimatedGas = await exchangeContract.estimate[tradeMethod](...args, overrides);
  overrides.gasLimit = calculatedGasMargin(estimatedGas);

  return exchangeContract.functions[tradeMethod](...args, overrides);
}
