import {
  SUPPORTED_CHAIN_ID,
} from '@uniswap/sdk';

interface IConfig {
  CHAIN_ID: SUPPORTED_CHAIN_ID,
  infuraId: string,
  portisAppId: string,
  fortmaticId: string,
  logRocketId: string,
  gtagId: string,
  bityClientId: string,
  bityPartnerFee: number,
}

function parseEnv<T>(v: any, type: string, defaultValue: T): T {
  if(!v) return defaultValue;

  if(type === 'number') {
    return (Number(v) as any) as T;
  }
  return v as T;
}

const config: IConfig = {
  CHAIN_ID: parseEnv<SUPPORTED_CHAIN_ID>(process.env.REACT_APP_CHAIN_ID, 'number', SUPPORTED_CHAIN_ID.Mainnet),
  infuraId: parseEnv<string>(process.env.REACT_APP_INFURA_ID, 'string', 'd118ed6a19594e16893c0c29d09a2536'),
  portisAppId: parseEnv<string>(process.env.REACT_APP_PORTIS_APP_ID, 'string', 'dd65a1a7-e0dc-4a9a-acc6-ae5ed5e48dc2'),
  fortmaticId: parseEnv<string>(process.env.REACT_APP_FORTMATIC_ID, 'string', 'pk_live_362BC03A6D2421B4'),
  logRocketId: parseEnv<string>(process.env.REACT_APP_LOG_ROCKET_ID, 'string', '282s2e/mooni'),
  gtagId: parseEnv<string>(process.env.REACT_APP_FORTMATIC_ID, 'string', 'UA-68373171-8'),
  bityClientId: parseEnv<string>(process.env.REACT_APP_BITY_CLIENT_ID, 'string', ''),
  bityPartnerFee: parseEnv<number>(process.env.REACT_APP_BITY_FEE, 'number', 0),
};

export default config;
