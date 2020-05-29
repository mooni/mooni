import { useState, useEffect } from 'react';

import {ethers} from 'ethers';
import { ETH } from '@uniswap/sdk';
import { useSelector } from 'react-redux';

import { fetchTokenBalance } from '../lib/currencies';

import { getETHManager } from '../redux/eth/selectors';

// TODO optimise queries
export function useBalance(symbol) {
  const ethManager = useSelector(getETHManager);
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if(!ethManager) {
      setBalance(null);
      return;
    }
    const ethAddress = ethManager.getAddress();

    if(symbol === ETH) {

      function updateBalance(res) {
        setBalance(ethers.utils.formatEther(res));
        setLoading(false);
      }

      ethManager.signer.getBalance().then(updateBalance);
      ethManager.provider.on(ethAddress, updateBalance);

      return () => ethManager.provider.removeListener(ethAddress, updateBalance);

    } else {

      function updateBalance() {
        fetchTokenBalance(symbol, ethAddress).then(res => {
          setBalance(res);
          setLoading(false);
        });
      }

      updateBalance();
      ethManager.provider.on('block', updateBalance);

      return () => ethManager.provider.removeListener('block', updateBalance);

    }
  }, [symbol, ethManager]);

  return { balanceLoading, balance };
}
