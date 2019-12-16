import BN from 'bignumber.js';
import { tradeTokensForExactEth, tradeExactTokensForEth } from '@uniswap/sdk'
import { ethers } from 'ethers';

import { TOKEN_DATA } from './currencies';
import Bity from './bity';

const stringifyObj = obj => JSON.parse(JSON.stringify(obj));

// TODO slippage

export async function getRate(rateRequest) {
  if(rateRequest.rateDirection === 'input') {

    let ethInputAmount = rateRequest.inputAmount;

    if(rateRequest.inputCurrency !== 'ETH') {
      console.log(rateRequest);
      const tokenRate = await rateExactTokenForETH(rateRequest.inputCurrency, rateRequest.inputAmount);
      ethInputAmount = tokenRate.outputAmount;
    }

    const bityRate = await Bity.estimate({
      inputCurrency: 'ETH',
      outputCurrency: rateRequest.outputCurrency,
      inputAmount: ethInputAmount,
    });

    return {
      ...rateRequest,
      inputAmount:  BN(rateRequest.inputAmount).toString(),
      outputAmount: BN(bityRate.outputAmount).toString(),
    };

  }
  else if(rateRequest.rateDirection === 'output') {

    const bityRate = await Bity.estimate({
      inputCurrency: 'ETH',
      outputCurrency: rateRequest.outputCurrency,
      outputAmount: rateRequest.outputAmount,
    });

    let finalInputAmount = bityRate.inputAmount;

    if(rateRequest.inputCurrency !== 'ETH') {
      const tokenRate = await rateTokenForExactETH(rateRequest.inputCurrency, bityRate.inputAmount);
      finalInputAmount = tokenRate.inputAmount;
    }

    return {
      ...rateRequest,
      inputAmount:  BN(finalInputAmount).toString(),
      outputAmount: BN(rateRequest.outputAmount).toString(),
    }
  }
}

export async function rateTokenForExactETH(symbol, ethAmount) {
  const { tokenAddress } = TOKEN_DATA[symbol];
  const exactETHAmount = ethers.utils.parseEther(ethAmount);
  console.log(exactETHAmount);

  const res = await tradeTokensForExactEth(tokenAddress, exactETHAmount);
  const serializedResponse = stringifyObj(res);

  console.log(serializedResponse);

  return {
    inputAmount: res.inputAmount.amount.div(10 ** res.inputAmount.token.decimals).toString(),
    outputAmount: res.outputAmount.amount.div(10 ** res.outputAmount.token.decimals).toString(),
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
    rate: serializedResponse.executionRate.rate,
    invertedRate: serializedResponse.executionRate.rateInverted,
  }
}
