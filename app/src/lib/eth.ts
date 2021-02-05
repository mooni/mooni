import { EventEmitter } from 'events';
import { ethers, providers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';

import config from '../config';
import { MetaError } from './errors';
import {BN} from "./numbers";
import { ExternalProvider } from '@ethersproject/providers';

const { chainId } = config;

function reloadPage() {
  window.location.reload()
}

interface ExtendedExternalProvider extends ExternalProvider {
  on?: any;
  removeAllListeners?: () => void;
  close?: () => void;
  isStatus?: Boolean;
}

export default class ETHManager {
  ethereum: ExtendedExternalProvider;
  provider: ethers.providers.Web3Provider;
  isContract: boolean= false;
  accounts: string[] = [];
  events: EventEmitter;

  constructor(ethereum: ExtendedExternalProvider) {
    this.events = new EventEmitter();
    this.ethereum = ethereum;
    this.provider = new ethers.providers.Web3Provider(this.ethereum);
  }

  static async create(ethereum: ExtendedExternalProvider) {
    const ethManager = new ETHManager(ethereum);
    const walletChainId = await ethManager.provider.send('eth_chainId', []);
    const walletChainIdBN = new BN(walletChainId);
    if(!walletChainIdBN.eq(chainId)) {
      throw new MetaError('eth_wrong_network_id', { expectedChainId: chainId, walletChainId: walletChainIdBN.toFixed() });
    }

    await ethManager.provider.send('eth_requestAccounts', []);
    await ethManager.updateAccounts();

    await ethManager.checkIsContract();
    if(ethManager.isContract) {
      ethManager.close();
      throw new MetaError('eth_smart_account_not_supported');
    }

    if (ethManager.ethereum.on && !ethereum.isStatus) {
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
    if(this.ethereum.on && this.ethereum.removeAllListeners && !this.ethereum.isStatus) {
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

export function getEtherscanAddressURL(address: string) {
  return `https://etherscan.io/address/${address}`;
}

export function getEtherscanTxURL(hash: string) {
  return `https://etherscan.io/tx/${hash}`;
}

/*
const getMethods = (obj) => {
  let properties = new Set()
  let currentObj = obj
  do {
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
  } while ((currentObj = Object.getPrototypeOf(currentObj)))
  // @ts-ignore
  return [...properties.keys()].filter(item => typeof obj[item] === 'function')
}
*/

export async function signerHelper(provider: providers.Web3Provider, rawMessage: string) {
  const ethereum = provider.provider as ExtendedExternalProvider;
  const signer = provider.getSigner();
  const address = await signer.getAddress();

  let params = [
    rawMessage,
    address.toLowerCase(),
  ];
  if(ethereum.isMetaMask) {
    params = [params[1], params[0]];
  }
  // @ts-ignore
  const signature = await ethereum.request({
    method: 'personal_sign',
    params,
  });
  return signature;
}
