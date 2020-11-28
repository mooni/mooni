import { useState, useEffect } from 'react';

import {ethers} from 'ethers';
import { ETHER } from '../lib/trading/currencies';
import { useSelector } from 'react-redux';

import { fetchTokenBalance } from '../lib/currencies';

import { getETHManager, getAddress } from '../redux/eth/selectors';

export function useBalance(symbol) {
  const ethManager = useSelector(getETHManager);
  const address = useSelector(getAddress);
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if(!ethManager) {
      setBalance(null);
      return;
    }
    const ethAddress = ethManager.getAddress();

    if(symbol === ETHER.symbol) {

      function updateBalance(res) {
        setBalance(ethers.utils.formatEther(res));
        setLoading(false);
      }

      const signer = ethManager.provider.getSigner();
      signer.getBalance().then(updateBalance);
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
  }, [symbol, ethManager, address]);

  return { balanceLoading, balance };
}
