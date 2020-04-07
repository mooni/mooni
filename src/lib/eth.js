import EventEmitter from 'events';
import { ethers } from 'ethers';

import WalletConnectProvider from '@walletconnect/web3-provider';
import Portis from '@portis/web3';
import ProviderEngine from 'web3-provider-engine';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
import TransporWebUSB from "@ledgerhq/hw-transport-webusb";
import createLedgerSubprovider from "@ledgerhq/web3-subprovider";

const infuraId = process.env.REACT_APP_INFURA_ID || 'd118ed6a19594e16893c0c29d09a2536';
const portisAppId = process.env.REACT_APP_PORTIS_APP_ID || 'dd65a1a7-e0dc-4a9a-acc6-ae5ed5e48dc2';

function reloadPage() {
  window.location.reload()
}

function getInfuraUrl(infuraId) {
  return `https://mainnet.infura.io/v3/${infuraId}`;
}

function defaultProviderEnable(engine) {
  return () => new Promise((resolve, reject) => {
    engine.sendAsync({ method: 'eth_accounts' }, (error, response) => {
      if (error) {
        reject(error)
      } else {
        resolve(response.result)
      }
    });
  });
}

class ETHManager extends EventEmitter {
  constructor(ethereum) {
    super();
    this.ethereum = ethereum;
  }

  async init() {
    this.accounts = await this.ethereum.enable();

    if (this.ethereum.on) {
      this.ethereum.on('accountsChanged', this.updateAccounts.bind(this));
      this.ethereum.on('networkChanged', reloadPage);
      this.ethereum.on('chainChanged', reloadPage);
      this.ethereum.on('stop', () => this.emit('stop'));
      this.ethereum.on('close', () => this.emit('stop'));
    }

    this.provider = new ethers.providers.Web3Provider(this.ethereum);
    this.signer = this.provider.getSigner();

    await this.checkNotContract();

    // TODO add error message in UI
    // if(await this.getNetworkId() !== MAINNET_NETWORK_ID) {
    //   throw new Error('not_on_mainnet');
    // }
  }

  async checkNotContract() {
    const code = await this.provider.getCode(this.getAddress());
    if(code !== '0x') {
      if(this.ethereum.close) {
        await this.ethereum.close();
      }
      throw new Error('eth_smart_account_not_supported');
    }
  }

  updateAccounts(accounts) {
    this.accounts = accounts;
    this.emit('accountsChanged', accounts);
  }

  close() {
    if(this.ethereum.on) {
      this.ethereum.removeAllListeners();
    }
    if(this.ethereum.close) {
      this.ethereum.close();
    }
    this.removeAllListeners();
  }

  async send(to, amount) {
    const transactionRequest = {
      to,
      value: ethers.utils.parseEther(amount),
    };
    const transactionResponse = await this.signer.sendTransaction(transactionRequest);

    return transactionResponse;
  }

  getAddress() {
    return this.accounts[0];
  }

  async getNetworkId() {
    return new Promise((res, rej) => {
      this.ethereum.sendAsync({
        method: 'net_version'
      }, (error, data) => {
        if (error) return rej(error);
        res(Number(data.result));
      });
    });
  }

  async waitForConfirmedTransaction(hash) {
    const receipt = await this.provider.waitForTransaction(hash);
    if(receipt.status === 0) {
      throw new Error('transaction-fail');
    }
  }

  static async createETHManager(walletType = 'injected') {
    const ethereum = await ETHManager.getWalletProvider(walletType);

    if (ethereum) {
      const ethManager = new ETHManager(ethereum);
      await ethManager.init();
      return ethManager;
    } else {
      throw new Error('no_ethereum_provider');
    }
  }

  static async getWalletProvider(walletType) {
    switch(walletType) {
      case 'injected': {
        return window.ethereum;
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
        engine.addProvider(new RpcSubprovider({ rpcUrl: getInfuraUrl(infuraId) }));
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
}

export function getEtherscanTxURL(hash) {
  return `https://etherscan.io/tx/${hash}`;
}

export default ETHManager;
