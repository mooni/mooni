import { ethers } from 'ethers';

import config from '../config';

const { chainId, infuraId } = config;

const networks = {
  1: 'homestead',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
};

export const defaultProvider = new ethers.providers.InfuraProvider(networks[chainId], infuraId);
