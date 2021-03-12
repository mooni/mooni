import { TokenObject, CurrencyType } from '../lib/trading/currencyTypes'
import { ChainId } from '@uniswap/sdk'

export default ([] as TokenObject[]).concat([
  {
    type: CurrencyType.ERC20,
    symbol: 'DAI',
    decimals: 18,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    chainId: ChainId.MAINNET,
  },
  {
    type: CurrencyType.ERC20,
    symbol: 'USDC',
    decimals: 6,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chainId: ChainId.MAINNET,
  },
  {
    type: CurrencyType.ERC20,
    symbol: 'WBTC',
    decimals: 8,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    chainId: ChainId.MAINNET,
  },
  {
    type: CurrencyType.ERC20,
    symbol: 'DAI',
    decimals: 18,
    address: '0x2448eE2641d78CC42D7AD76498917359D961A783',
    chainId: ChainId.RINKEBY,
  },
])
