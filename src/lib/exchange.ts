import BN from 'bignumber.js';
import {
  EXCHANGE_ABI,
  getExecutionDetails,
  TRADE_METHODS,
  tradeExactTokensForEth,
  tradeTokensForExactEth,
  SUPPORTED_CHAIN_ID,
  ETH,
} from '@uniswap/sdk';
import {ethers} from 'ethers';

import ERC20_ABI from './abis/ERC20.json';
import {TOKEN_DATA} from './currencies';
import Bity from './bity';

import {DexTrade, ExchangePath, Order, OrderRequest, RateRequest, RateResult, TradeExact} from './types';

const stringifyObj = obj => JSON.parse(JSON.stringify(obj));

const CHAIN_ID = SUPPORTED_CHAIN_ID.Mainnet;
// const CHAIN_ID = SUPPORTED_CHAIN_ID.Rinkeby;

// TODO slippage

function calculatedGasMargin(gas) {
  const offset = gas.mul(1000).div(10000);
  return gas.add(offset);
}

export async function getRate(rateRequest: RateRequest) {
  const rateResult: RateResult = {
    inputCurrency: rateRequest.inputCurrency,
    outputCurrency: rateRequest.outputCurrency,
    tradeExact: rateRequest.tradeExact,
    inputAmount: '',
    outputAmount: '',
    fees: {},
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

    rateResult.inputAmount = new BN(rateRequest.amount).toString();
    rateResult.outputAmount = new BN(bityRate.outputAmount).toString();
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

    rateResult.inputAmount = new BN(finalInputAmount).toString();
    rateResult.outputAmount = new BN(rateRequest.amount).toString();
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
  const { tokenAddress } = TOKEN_DATA[symbol];
  const exactAmount = ethers.utils.parseEther(String(amount)); // TODO token decimals

  const method = (
    (tradeExact === TradeExact.INPUT && tradeExactTokensForEth) ||
    (tradeExact === TradeExact.OUTPUT && tradeTokensForExactEth)
  );
  if(!method) throw new Error('invalid tradeExact');

  const tradeDetails = await method(tokenAddress, exactAmount, CHAIN_ID);
  const serializedResponse = stringifyObj(tradeDetails);

  return {
    inputAmount: tradeDetails.inputAmount.amount.div(10 ** tradeDetails.inputAmount.token.decimals).toString(),
    outputAmount: tradeDetails.outputAmount.amount.div(10 ** tradeDetails.outputAmount.token.decimals).toString(),
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
    const allowanceAmount = tradeDetails.inputAmount.amount.toString();
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
  const args = executionDetails.methodArguments.map(a => a.toString());

  const overrides: any = {
    value: ethers.utils.parseEther(executionDetails.value.toString()),
  };

  const estimatedGas = await exchangeContract.estimate[tradeMethod](...args, overrides);
  overrides.gasLimit = calculatedGasMargin(estimatedGas);

  return exchangeContract.functions[tradeMethod](...args, overrides);
}
