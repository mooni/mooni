import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

import Fortmatic from 'fortmatic';
import Portis from '@portis/web3';
import { IFrameEthereumProvider } from '@ethvault/iframe-provider';
import WalletConnectProvider from '@walletconnect/web3-provider';
import ProviderEngine from 'web3-provider-engine';
import TransporWebUSB from '@ledgerhq/hw-transport-webusb';
import createLedgerSubprovider from '@ledgerhq/web3-subprovider';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';

import config from '../config';
import { logError } from './log';

const { CHAIN_ID, infuraId, portisAppId, fortmaticId } = config;

const networks = {
  1: 'homestead',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
};
export const defaultProvider = new ethers.providers.InfuraProvider(networks[CHAIN_ID], infuraId);

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
    case 'Portis': {
      const portis = new Portis(portisAppId, 'mainnet');
      portis.provider.enable = defaultProviderEnable(portis.provider);
      return portis.provider;
    }
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
    error?.code === 4001 ||  // Metamask
    (error && error.message && String(error.message).includes('User canceled')) // Trust wallet
  )
    return new Error('user-rejected-transaction');
  logError(error);
  return error;
}

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId,
      qrcodeModalOptions: {
        mobileLinks: [
          'rainbow',
          'metamask',
          'trust',
          'pillar',
        ],
      },
    },
  },
  portis: {
    package: Portis,
    options: {
      id: portisAppId
    }
  },
  fortmatic: {
    package: Fortmatic,
    options: {
      key: fortmaticId
    }
  }
};

export const web3Modal = new Web3Modal({
  'network': 'mainnet',
  'cacheProvider': true,
  providerOptions,
});
