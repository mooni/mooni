import {
  SUPPORTED_CHAIN_ID,
} from '@uniswap/sdk';

interface IConfig {
  CHAIN_ID: SUPPORTED_CHAIN_ID,
  infuraId: string,
  portisAppId: string,
  fortmaticId: string,
}

function parseEnv<T>(v: any, type: string): T | null {
  if(!v) return null;

  if(type === 'number') {
    return (Number(v) as any) as T;
  }
  return v as T;
}

const config: IConfig = {
  CHAIN_ID: parseEnv<SUPPORTED_CHAIN_ID>(process.env.REACT_APP_CHAIN_ID, 'number') || SUPPORTED_CHAIN_ID.Mainnet,
  infuraId: parseEnv<string>(process.env.REACT_APP_INFURA_ID, 'string') || 'd118ed6a19594e16893c0c29d09a2536',
  portisAppId: parseEnv<string>(process.env.REACT_APP_PORTIS_APP_ID, 'string') || 'dd65a1a7-e0dc-4a9a-acc6-ae5ed5e48dc2',
  fortmaticId: parseEnv<string>(process.env.REACT_APP_FORTMATIC_ID, 'string') || 'pk_live_362BC03A6D2421B4',
};

export default config;
