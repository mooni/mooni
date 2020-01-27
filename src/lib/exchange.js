import BN from 'bignumber.js';
import { tradeTokensForExactEth, tradeExactTokensForEth } from '@uniswap/sdk'
import { ethers } from 'ethers';

import { TOKEN_DATA } from './currencies';
import Bity from './bity';

const stringifyObj = obj => JSON.parse(JSON.stringify(obj));

// TODO slippage

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

  const res = await tradeTokensForExactEth(tokenAddress, exactETHAmount);
  const serializedResponse = stringifyObj(res);

  return {
    inputAmount: res.inputAmount.amount.div(10 ** res.inputAmount.token.decimals).toString(),
    outputAmount: res.outputAmount.amount.div(10 ** res.outputAmount.token.decimals).toString(),
    inputCurrency: symbol,
    outputCurrency: 'ETH',
    rate: serializedResponse.executionRate.rate,
    invertedRate: serializedResponse.executionRate.rateInverted,
  }
}

export async function rateExactTokenForETH(symbol, tokenAmount) {
  const { tokenAddress } = TOKEN_DATA[symbol];
 const exactTokenAmount = ethers.utils.parseEther(String(tokenAmount));

  const res = await tradeExactTokensForEth(tokenAddress, exactTokenAmount);
  const serializedResponse = stringifyObj(res);

  console.log(serializedResponse);
  return {
    inputAmount: res.inputAmount.amount.div(10 ** res.inputAmount.token.decimals).toString(),
    outputAmount: res.outputAmount.amount.div(10 ** res.outputAmount.token.decimals).toString(),
    inputCurrency: symbol,
    outputCurrency: 'ETH',
    rate: serializedResponse.executionRate.rate,
    invertedRate: serializedResponse.executionRate.rateInverted,
  }
}
