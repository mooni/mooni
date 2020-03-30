import BN from 'bignumber.js';
import { tradeTokensForExactEth, tradeExactTokensForEth, getExecutionDetails, getTokenReserves, EXCHANGE_ABI, TRADE_METHODS } from '@uniswap/sdk';
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

export async function getRate({ inputCurrency, outputCurrency, amount, tradeExact }) {
  const rateResult = {
    inputCurrency,
    outputCurrency,
    tradeExact,
  };

  if(tradeExact === 'INPUT') {

    let ethInputAmount = amount;

    if(inputCurrency !== 'ETH') {
      const tokenRate = await rateTokenToETH(inputCurrency, amount, 'EXACT_TOKEN');
      ethInputAmount = tokenRate.outputAmount;
    }

    const bityRate = await Bity.estimate({
      inputCurrency: 'ETH',
      outputCurrency: outputCurrency,
      amount: ethInputAmount,
      tradeExact: 'INPUT'
    });

    rateResult.inputAmount = BN(amount).toString();
    rateResult.outputAmount = BN(bityRate.outputAmount).toString();
    rateResult.fees = bityRate.fees;

  } else if(tradeExact === 'OUTPUT') {

    const bityRate = await Bity.estimate({
      inputCurrency: 'ETH',
      outputCurrency: outputCurrency,
      amount: amount,
      tradeExact: 'OUTPUT'
    });

    let finalInputAmount = bityRate.inputAmount;

    if(inputCurrency !== 'ETH') {
      const tokenRate = await rateTokenToETH(inputCurrency, bityRate.inputAmount, 'EXACT_ETH');
      finalInputAmount = tokenRate.inputAmount;
    }

    rateResult.inputAmount = BN(finalInputAmount).toString();
    rateResult.outputAmount = BN(amount).toString();
    rateResult.fees = bityRate.fees;

  } else {
    throw new Error('invalid TRADE_EXACT');
  }

  return rateResult;
}

export async function rateTokenToETH(symbol, amount, tradeExact) {
  const { tokenAddress } = TOKEN_DATA[symbol];
  const exactAmount = ethers.utils.parseEther(String(amount)); // TODO token decimals

  const method = (
    (tradeExact === 'EXACT_TOKEN' && tradeExactTokensForEth) ||
    (tradeExact === 'EXACT_ETH' && tradeTokensForExactEth)
  );

  const tradeDetails = await method(tokenAddress, exactAmount);
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

export async function getExchangeAddress(symbol) {
  const { tokenAddress } = TOKEN_DATA[symbol];
  const tokenReserves = await getTokenReserves(tokenAddress);
  return tokenReserves.exchange.address;
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
    const estimatedGas = await tokenContract.estimate.approve(executionDetails.exchangeAddress, allowanceAmount)
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
