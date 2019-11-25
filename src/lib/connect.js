import { ethers } from 'ethers';
import Web3 from 'web3';

class Connect {
  constructor(obj) {
    Object.assign(this, obj);
  }

  static async initWeb3() {
    const { ethereum } = window;

    if (ethereum) {
      ethereum.autoRefreshOnNetworkChange = false;
      ethereum.on('networkChange', () => window.reload());

      try {
        const accounts = await ethereum.enable();
        const web3 = new Web3(ethereum);
        const provider = new ethers.providers.Web3Provider(ethereum);

        const connect = new Connect({
          web3,
          provider,
          ethereum,
          accounts,
        });
        return connect;
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
        from: Connect.address,
        params: params,
      }, (err, result) => {
        if(err) return reject(err);
        resolve(result);
      })
    });
  }
};

export default Connect;
