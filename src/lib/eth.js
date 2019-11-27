import EventEmitter from 'events';
import { ethers } from 'ethers';

export const MAINNET_NETWORK_ID = 1;

function reloadPage() {
  console.log('fezfez');
  window.location.reload()
}

class ETHManager extends EventEmitter {
  constructor(ethereum) {
    super();
    this.ethereum = ethereum;
  }

  async init() {
    await this.ethereum.enable();

    this.accounts = (await this.ethereum.send('eth_accounts')).result;
    this.netVersion = Number((await this.ethereum.send('net_version')).result);

    if(this.netVersion !== MAINNET_NETWORK_ID) {
      throw new Error('provider_not_mainnet')
    }

    if(this.ethereum.on) {
      this.ethereum.on('accountsChanged', this.updateAccounts.bind(this));
      this.ethereum.on('networkChanged', reloadPage);
      this.ethereum.on('chainChanged', reloadPage);
    }

    this.ethers = new ethers.providers.Web3Provider(this.ethereum);
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

  static async initWeb3() {
    const { ethereum } = window;

    if (ethereum) {
      try {
        const ethManager = new ETHManager(ethereum);
        await ethManager.init();
        return ethManager;
      } catch (error) {
        console.error(error);
        throw new Error('unable to open eth account');
      }
    } else {
      console.log('no ethereum');
      throw new Error('no ethereum injected');
    }
  }

  async send(to, amount) {
    const gasLimit = 40000; // TODO
    const gasPrice = 2; // TODO

    const params = [{
      from: this.accounts[0],
      to,
      gas: ethers.utils.hexlify(gasLimit),
      gasPrice: ethers.utils.hexlify(ethers.utils.parseUnits(String(gasPrice), 'gwei')),
      value: ethers.utils.hexlify(ethers.utils.parseEther(amount)),
    }];

    console.log(params);

    return new Promise((resolve, reject) => {
      this.ethereum.sendAsync({
        method: 'eth_sendTransaction',
        params: params,
      }, (err, result) => {
        if(err) return reject(err);
        resolve(result);
      })
    });
  }

  getAddress() {
    return this.accounts[0];
  }
}

export default ETHManager;
