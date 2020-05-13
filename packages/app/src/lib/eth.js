import EventEmitter from 'events';
import { ethers } from 'ethers';

import { getWalletProvider } from './web3Providers';

import config from '../config';
import MetaError from './errors';

const { CHAIN_ID } = config;

function reloadPage() {
  window.location.reload()
}

export default class ETHManager extends EventEmitter {
  constructor(ethereum) {
    super();
    this.ethereum = ethereum;
  }

  async init() {
    await this.ethereum.enable();

    this.provider = new ethers.providers.Web3Provider(this.ethereum);
    await this.updateAccounts();

    if (this.ethereum.on) {
      this.ethereum.on('accountsChanged', this.updateAccounts.bind(this));
      this.ethereum.on('networkChanged', reloadPage);
      this.ethereum.on('chainChanged', reloadPage);
      this.ethereum.on('stop', () => this.emit('stop'));
      this.ethereum.on('close', () => this.emit('stop'));
    }

    this.signer = this.provider.getSigner();

    await this.checkIsContract();
    if(this.isContract) {
      this.close();
      throw new Error('eth_smart_account_not_supported');
    }

    if(await this.getNetworkId() !== CHAIN_ID) {
      this.close();
      throw new MetaError('eth_wrong_network_id', { networkId: CHAIN_ID });
    }
  }

  async checkIsContract() {
    const code = await this.provider.getCode(this.getAddress());
    this.isContract = code !== '0x';
  }

  async updateAccounts() {
    this.accounts = await this.provider.send('eth_accounts', []);
    this.emit('accountsChanged', this.accounts);
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
    const ethereum = await getWalletProvider(walletType);

    if (ethereum) {
      const ethManager = new ETHManager(ethereum);
      await ethManager.init();
      return ethManager;
    } else {
      throw new Error('no_ethereum_provider');
    }
  }
}

export function getEtherscanTxURL(hash) {
  return `https://etherscan.io/tx/${hash}`;
}
