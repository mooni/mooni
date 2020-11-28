import axios from 'axios';
import {ParaSwap, APIError, Transaction} from 'paraswap';
import { CurrencyType, ETHER, Token} from './currencies';
import {amountToDecimal, amountToInt, BN} from '../numbers';
import {DexTrade, TradeExact, TradeRequest, TradeType} from './types';
import { providers } from 'ethers';
import { defaultProvider } from '../web3Providers';

const paraSwap = new ParaSwap().setWeb3Provider(defaultProvider);
const paraswapAxios = axios.create({
  baseURL: 'https://api.paraswap.io/v2',
  timeout: 10000,
});

// (async () => {
//   console.log(await paraSwap.getSpender());
// })();

interface IDexProxy {
  isTokenExchangeable(Token): Promise<boolean>;
  getRate(TradeRequest): Promise<DexTrade>;
  checkAllowance(DexTrade, any): Promise<string | null>;
  executeTrade(DexTrade, any): Promise<string>;
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

  async checkAllowance(dexTrade: DexTrade, provider: providers.Web3Provider): Promise<string | null> {
    //TODO
    const signer = provider.getSigner();
    const senderAddress = await signer.getAddress();
    const tokenAddress = (dexTrade.tradeRequest.inputCurrency as Token).address;

    const intAmount = amountToInt(dexTrade.inputAmount, dexTrade.tradeRequest.inputCurrency.decimals);
    // const paraSwapSigned = new ParaSwap().setWeb3Provider(provider);
    // const spenderAddress = await paraSwap.getSpender();
    // if((<APIError>spenderAddress).message)  throw new Error((<APIError>spenderAddress).message)

    const allowanceRes = await paraSwap.getAllowance(senderAddress, tokenAddress);
    if((<APIError>allowanceRes).message) throw new Error((<APIError>allowanceRes).message);

    const allowance = (<any>allowanceRes).allowance;
    if(new BN(intAmount).gt(allowance)) {

      const txHash = await paraSwap.approveToken(intAmount, senderAddress, tokenAddress);
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
    if((<APIError>txParams).message) throw new Error((<APIError>txParams).message);

    const tx = await signer.sendTransaction(<Transaction>txParams);
    return <string>tx.hash;
  },
};

export default DexProxy;
