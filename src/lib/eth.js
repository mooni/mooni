import EventEmitter from 'events';
import { ethers } from 'ethers';

export const MAINNET_NETWORK_ID = 1;

function reloadPage() {
  window.location.reload()
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
    }

    this.provider = new ethers.providers.Web3Provider(this.ethereum);
    this.signer = this.provider.getSigner();

    // TODO add error message in UI
    // if(await this.getNetworkId() !== MAINNET_NETWORK_ID) {
    //   throw new Error('not_on_mainnet');
    // }
  }

  updateAccounts(accounts) {
    this.accounts = accounts;
    this.emit('accountsChanged', accounts);
  }

  close() {
    if(this.ethereum.on) {
      this.ethereum.removeAllListeners();
    }
    this.removeAllListeners();
  }

  static async createETHManager() {
    const { ethereum } = window;

    if (ethereum) {
      const ethManager = new ETHManager(ethereum);
      await ethManager.init();
      return ethManager;
    } else {
      throw new Error('no ethereum injected');
    }
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
}

export default ETHManager;
