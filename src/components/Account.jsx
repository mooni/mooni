import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, EthIdenticon, AddressField } from '@aragon/ui'
import { Box } from '@material-ui/core';

import { getAddress } from '../redux/eth/selectors';
import { initConnect } from '../redux/eth/actions';

function Account() {
  const address = useSelector(getAddress);
  const dispatch = useDispatch();

  if(!address) {
    return (
      <Button onClick={() => dispatch(initConnect())} mode="strong">Login</Button>
    );
  }

  return (
    <>
      <Box display={{ xs: 'block', sm: 'none' }} mx="auto">
        <EthIdenticon address={address} scale={1.6}/>
      </Box>
      <Box display={{ xs: 'none', sm: 'block' }} width={200}>
        <AddressField address={address} />
      </Box>
    </>
  );
}

export default Account;
