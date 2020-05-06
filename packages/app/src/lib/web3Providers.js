
// import Portis from '@portis/web3';
import { IFrameEthereumProvider } from '@ethvault/iframe-provider';
import WalletConnectProvider from '@walletconnect/web3-provider';
import ProviderEngine from 'web3-provider-engine';
import TransporWebUSB from '@ledgerhq/hw-transport-webusb';
import createLedgerSubprovider from '@ledgerhq/web3-subprovider';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';

const infuraId = process.env.REACT_APP_INFURA_ID || 'd118ed6a19594e16893c0c29d09a2536';
const portisAppId = process.env.REACT_APP_PORTIS_APP_ID || 'dd65a1a7-e0dc-4a9a-acc6-ae5ed5e48dc2';

function getInfuraUrl(infuraId) {
  return `https://mainnet.infura.io/v3/${infuraId}`;
}

function defaultProviderEnable(_) {
  return async () => null;
}

export async function getWalletProvider(walletType) {
  switch (walletType) {
    case 'injected': {
      return window.ethereum;
    }
    case 'iframe': {
      const provider = new IFrameEthereumProvider();
      provider.enable = defaultProviderEnable(provider);
      return provider;
    }
    case 'WalletConnect': {
      return new WalletConnectProvider({
        infuraId,
      });
    }
    case 'Ledger': {
      const engine = new ProviderEngine();
      const getTransport = () => TransporWebUSB.create();
      const ledger = createLedgerSubprovider(getTransport);

      engine.addProvider(ledger);
      engine.addProvider(new RpcSubprovider({rpcUrl: getInfuraUrl(infuraId)}));
      engine.enable = defaultProviderEnable(engine);
      engine.start();

      return engine;
    }
    // case 'Portis': {
    //   const portis = new Portis(portisAppId, 'mainnet');
    //   portis.provider.enable = defaultProviderEnable(portis.provider);
    //   return portis.provider;
    // }
    default: {
      throw new Error('wallet-provider-not-supported')
    }
  }
}

export function detectIframeWeb3Provider() {
  return new Promise(resolve => {

    const isIframe = window && window.parent && window.self && window.parent !== window.self;
    if(!isIframe) return resolve(false);

    function listener(e) {
      if(e?.data?.jsonrpc === '2.0' && e?.data?.id === 'detect-web3-iframe') {
        resolve(true);
        window.removeEventListener('message', listener);
      }
    }
    window.addEventListener('message', listener);

    window.parent.postMessage({
      id: 'detect-web3-iframe',
      jsonrpc: '2.0',
      method: 'web3_clientVersion'
    }, '*');

    setTimeout(() => {
      resolve(false);
      window.removeEventListener('message', listener);
    }, 1000);

  });
}

export function detectWalletError(error) {
  if(
    error.code === 4001 ||  // Metamask
    error.message.includes('User canceled') // Trust wallet
  )
    return new Error('user-rejected-transaction');
  return null;
}
