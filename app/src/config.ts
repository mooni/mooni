import { ChainId } from '@uniswap/sdk'

interface IConfig {
  chainId: ChainId
  infuraId: string
  portisAppId: string
  fortmaticId: string
  logRocketId: string
  gtagId: string
  enableAnalytics: boolean
  referralSharing: number
  discordInviteUrl: string
  private: {
    bityClientId: string
    bityClientSecret: string
    bityPartnerFee: number
    adminToken: string
  }
}

function parseEnv<T extends string | number | boolean>(v: any, defaultValue: T): T {
  if (!v) return defaultValue

  if (typeof defaultValue === 'number') {
    return Number(v) as T
  }
  if (typeof defaultValue === 'boolean') {
    return Boolean(v === 'true') as T
  }
  return v as T
}

const config: IConfig = {
  chainId: parseEnv(process.env.REACT_APP_CHAIN_ID, ChainId.MAINNET),
  infuraId: parseEnv(process.env.REACT_APP_INFURA_ID, 'd118ed6a19594e16893c0c29d09a2536'),
  portisAppId: parseEnv(process.env.REACT_APP_PORTIS_APP_ID, 'dd65a1a7-e0dc-4a9a-acc6-ae5ed5e48dc2'),
  fortmaticId: parseEnv(process.env.REACT_APP_FORTMATIC_ID, 'pk_live_362BC03A6D2421B4'),
  logRocketId: parseEnv(process.env.REACT_APP_LOG_ROCKET_ID, '282s2e/mooni'),
  enableAnalytics: parseEnv(process.env.REACT_APP_ENABLE_ANALYTICS, false),
  gtagId: parseEnv(process.env.REACT_APP_GTAG_ID, 'UA-68373171-8'),
  discordInviteUrl: 'https://discord.gg/beq7cBCd2q',
  referralSharing: 0.1,
  private: {
    bityClientId: parseEnv(process.env.PRIVATE_BITY_CLIENT_ID, ''),
    bityClientSecret: parseEnv(process.env.PRIVATE_BITY_CLIENT_SECRET, ''),
    bityPartnerFee: parseEnv(process.env.PRIVATE_BITY_FEE, 0),
    adminToken: parseEnv(process.env.PRIVATE_ADMIN_TOKEN, ''),
  },
}

export default config
