import BN from 'bignumber.js';
import { tradeTokensForExactEth, tradeExactTokensForEth, getExecutionDetails, EXCHANGE_ABI, TRADE_METHODS } from '@uniswap/sdk'
import ERC20_ABI from './abis/ERC20.json';
import { ethers } from 'ethers';

import { TOKEN_DATA } from './currencies';
import Bity from './bity';

const stringifyObj = obj => JSON.parse(JSON.stringify(obj));

// TODO slippage

function calculatedGasMargin(gas) {
  const offset = gas.mul(1000).div(10000);
  return gas.add(offset);
}

export async function getRate(rateRequest) {
  if(rateRequest.tradeExact === 'INPUT') {

    let ethInputAmount = rateRequest.amount;

    if(rateRequest.inputCurrency !== 'ETH') {
      const tokenRate = await rateExactTokenForETH(rateRequest.inputCurrency, rateRequest.amount);
      ethInputAmount = tokenRate.outputAmount;
    }

    const bityRate = await Bity.estimate({
      inputCurrency: 'ETH',
      outputCurrency: rateRequest.outputCurrency,
      inputAmount: ethInputAmount,
    });

    return {
      inputCurrency: rateRequest.inputCurrency,
      outputCurrency: rateRequest.outputCurrency,
      inputAmount:  BN(rateRequest.amount).toString(),
      outputAmount: BN(bityRate.outputAmount).toString(),
    };

  }
  else if(rateRequest.tradeExact === 'OUTPUT') {

    const bityRate = await Bity.estimate({
      inputCurrency: 'ETH',
      outputCurrency: rateRequest.outputCurrency,
      outputAmount: rateRequest.amount,
    });

    let finalInputAmount = bityRate.inputAmount;

    if(rateRequest.inputCurrency !== 'ETH') {
      const tokenRate = await rateTokenForExactETH(rateRequest.inputCurrency, bityRate.inputAmount);
      finalInputAmount = tokenRate.inputAmount;
    }

    return {
      ...rateRequest,
      inputAmount:  BN(finalInputAmount).toString(),
      outputAmount: BN(rateRequest.amount).toString(),
    }
  } else {
    throw new Error('invalid TRADE_EXACT')
  }
}

export async function rateTokenForExactETH(symbol, ethAmount) {
  const { tokenAddress } = TOKEN_DATA[symbol];
  const exactETHAmount = ethers.utils.parseEther(ethAmount);

  const tradeDetails = await tradeTokensForExactEth(tokenAddress, exactETHAmount);
  const serializedResponse = stringifyObj(tradeDetails);

  return {
    inputAmount: tradeDetails.inputAmount.amount.div(10 ** tradeDetails.inputAmount.token.decimals).toString(),
    outputAmount: tradeDetails.outputAmount.amount.div(10 ** tradeDetails.outputAmount.token.decimals).toString(),
    inputCurrency: symbol,
    outputCurrency: 'ETH',
    rate: serializedResponse.executionRate.rate,
    invertedRate: serializedResponse.executionRate.rateInverted,
    tradeDetails,
  }
}

export async function rateExactTokenForETH(symbol, tokenAmount) {
  const { tokenAddress } = TOKEN_DATA[symbol];
 const exactTokenAmount = ethers.utils.parseEther(String(tokenAmount));

  const tradeDetails = await tradeExactTokensForEth(tokenAddress, exactTokenAmount);
  const serializedResponse = stringifyObj(tradeDetails);

  return {
    inputAmount: tradeDetails.inputAmount.amount.div(10 ** tradeDetails.inputAmount.token.decimals).toString(),
    outputAmount: tradeDetails.outputAmount.amount.div(10 ** tradeDetails.outputAmount.token.decimals).toString(),
    inputCurrency: symbol,
    outputCurrency: 'ETH',
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
  const allowance = await tokenContract.allowance(senderAddress, executionDetails.exchangeAddress);

  if(tradeDetails.inputAmount.amount.gt(allowance)) {
    const allowanceAmount = tradeDetails.inputAmount.amount.toString();
    const estimatedGas = await tokenContract.estimate.approve(executionDetails.exchangeAddress, allowanceAmount)
    const gasLimit = calculatedGasMargin(estimatedGas);
    console.log(estimatedGas.toString(), gasLimit.toString());
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

export async function executeTrade(tradeDetails, recipient, signer) {
  const executionDetails = getExecutionDetails(
    tradeDetails,
    null, // max slippage, default 200 (2%)
    null, // deadline, default 10 minutes
    recipient,
  );

  const exchangeContract = new ethers.Contract(executionDetails.exchangeAddress, EXCHANGE_ABI, signer);

  const tradeMethod = TRADE_METHODS[executionDetails.methodName];
  const args = executionDetails.methodArguments.map(a => a.toString());

  const overrides = {
    value: ethers.utils.parseEther(executionDetails.value.toString()),
  };

  const estimatedGas = await exchangeContract.estimate[tradeMethod](...args, overrides);
  overrides.gasLimit = calculatedGasMargin(estimatedGas);

  return exchangeContract.functions[tradeMethod](...args, overrides);
}
