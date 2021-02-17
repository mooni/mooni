import Web3Modal from 'web3modal';

import { IFrameEthereumProvider } from './iFrameProvider';
import WalletConnectProvider from '@walletconnect/web3-provider';
import ProviderEngine from 'web3-provider-engine';
import TransporWebUSB from '@ledgerhq/hw-transport-webusb';
import createLedgerSubprovider from '@ledgerhq/web3-subprovider';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';

import config from '../config';
import { logError } from './log';
import { BityOrderError } from './wrappers/bityTypes';
import { MetaError } from './errors';

const { infuraId } = config;

function getInfuraUrl(infuraId) {
  return `https://mainnet.infura.io/v3/${infuraId}`;
}

export async function getWalletProvider(walletType) {
  switch (walletType) {
    case 'injected': {
      return window.ethereum;
    }
    case 'iframe': {
      return new IFrameEthereumProvider();
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
      engine.start();

      return engine;
    }
    /*
    case 'Portis': {
      const portis = new Portis(portisAppId, 'mainnet');
      portis.provider.enable = defaultProviderEnable(portis.provider);
      return portis.provider;
    }
    */
    default: {
      throw new Error('wallet-provider-not-supported')
    }
  }
}

export function detectWalletError(error) {
  if(error instanceof MetaError || error instanceof BityOrderError) {
    return error;
  }
  else if(
    error?.code === 4001 ||  // Metamask
    (error && error.message && String(error.message).includes('User canceled')) // Trust wallet
  ) {
    return new Error('user-rejected-transaction');
  } else {
    logError('wallet-error', error);
    return error;
  }
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
        ],
      },
    },
  },
  /*
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
  */
};

export const web3Modal = new Web3Modal({
  'network': 'mainnet',
  'cacheProvider': true,
  providerOptions,
});
