import EventEmitter from 'events';
import { ethers } from 'ethers';

// export const MAINNET_NETWORK_ID = 1;

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

    if(this.ethereum.on) {
      this.ethereum.on('accountsChanged', this.updateAccounts.bind(this));
      this.ethereum.on('networkChanged', reloadPage);
      this.ethereum.on('chainChanged', reloadPage);
    }

    this.provider = new ethers.providers.Web3Provider(this.ethereum);
    this.signer = this.provider.getSigner();
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
      try {
        const ethManager = new ETHManager(ethereum);
        await ethManager.init();
        return ethManager;
      } catch (error) {
        console.error(error);
        throw error;
      }
    } else {
      console.log('no ethereum');
      throw new Error('no ethereum injected');
    }
  }

  async send(to, amount) {
    const gasLimit = 40000; // TODO
    const gasPrice = 2; // TODO

    const transactionRequest = {
      to,
      gasLimit,
      gasPrice: ethers.utils.parseUnits(String(gasPrice), 'gwei'),
      value: ethers.utils.parseEther(amount),
    };
    const transactionResponse = await this.signer.sendTransaction(transactionRequest);

    return transactionResponse;
  }

  getAddress() {
    return this.accounts[0];
  }
}

export default ETHManager;
