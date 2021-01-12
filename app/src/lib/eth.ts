import { EventEmitter } from 'events';
import { ethers, providers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';

import config from '../config';
import { MetaError } from './errors';
import {BN} from "./numbers";

const { chainId } = config;

function reloadPage() {
  window.location.reload()
}

export default class ETHManager {
  ethereum: any;
  provider: ethers.providers.Web3Provider;
  isContract: boolean= false;
  accounts: string[] = [];
  events: EventEmitter;

  constructor(ethereum) {
    this.events = new EventEmitter();
    this.ethereum = ethereum;
    this.provider = new ethers.providers.Web3Provider(this.ethereum);
  }

  static async create(ethereum) {
    if(!new BN(ethereum.chainId).eq(chainId)) {
      throw new MetaError('eth_wrong_network_id', { networkId: chainId });
    }

    const ethManager = new ETHManager(ethereum);
    await ethManager.provider.send('eth_requestAccounts', []);
    await ethManager.updateAccounts();

    await ethManager.checkIsContract();
    if(ethManager.isContract) {
      ethManager.close();
      throw new MetaError('eth_smart_account_not_supported');
    }

    if (ethManager.ethereum.on) {
      ethManager.ethereum.on('accountsChanged', ethManager.updateAccounts.bind(ethManager));
      ethManager.ethereum.on('networkChanged', reloadPage);
      ethManager.ethereum.on('chainChanged', reloadPage);
      ethManager.ethereum.on('stop', () => ethManager.events.emit('stop'));
      ethManager.ethereum.on('close', () => ethManager.events.emit('stop'));
      ethManager.ethereum.on('disconnect', () => ethManager.events.emit('stop'));
    }

    return ethManager;
  }

  async checkIsContract() {
    const code = await this.provider.getCode(this.getAddress());
    this.isContract = code !== '0x';
  }

  async updateAccounts() {
    this.accounts = await this.provider.send('eth_accounts', []);
    this.events.emit('accountsChanged', this.accounts);
  }

  close() {
    if(this.ethereum.on) {
      this.ethereum.removeAllListeners();
    }
    if(this.ethereum.close) {
      this.ethereum.close();
    }
    this.events.removeAllListeners();
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

export async function shittySigner(provider: providers.Web3Provider, rawMessage: string) {
  if(provider.provider instanceof WalletConnectProvider) {
    const rawMessageLength = new Blob([rawMessage]).size
    const message = ethers.utils.toUtf8Bytes("\x19Ethereum Signed Message:\n" + rawMessageLength + rawMessage)
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const keccakMessage = ethers.utils.keccak256(message);

    const wc = provider.provider as WalletConnectProvider;
    const signature = await wc.connector.signMessage([
      address.toLowerCase(),
      keccakMessage,
    ]);
    return signature;
  } else {
    const signer = provider.getSigner();
    return await signer.signMessage(rawMessage);
  }
}
