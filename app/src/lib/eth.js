import EventEmitter from 'events';
import { ethers } from 'ethers';

import config from '../config';
import { MetaError } from './errors';

const { chainId } = config;

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
      this.ethereum.on('disconnect', () => this.emit('stop'));
    }

    await this.checkIsContract();
    if(this.isContract) {
      this.close();
      throw new Error('eth_smart_account_not_supported');
    }

    if(await this.getNetworkId() !== chainId) {
      this.close();
      throw new MetaError('eth_wrong_network_id', { networkId: chainId });
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
    const signer = this.provider.getSigner();
    const transactionResponse = await signer.sendTransaction(transactionRequest);

    return transactionResponse;
  }

  getAddress() {
    return this.accounts[0];
  }

  async getNetworkId() {
    return this.provider.send('net_version').then(Number);
  }

  async waitForConfirmedTransaction(hash) {
    const receipt = await this.provider.waitForTransaction(hash);
    if(receipt.status === 0) {
      throw new Error('transaction-fail');
    }
  }
}

export function getEtherscanTxURL(hash) {
  return `https://etherscan.io/tx/${hash}`;
}
