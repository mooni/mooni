import { EthereumAddress } from '../../types/api';

export function compareAddresses(a: EthereumAddress, b: EthereumAddress) {
  return a.toLowerCase() === b.toLowerCase();
}