import React from 'react';
import { useSelector } from 'react-redux';

import { EthIdenticon, AddressField } from '@aragon/ui'
import { Box } from '@material-ui/core';

import { getAddress } from '../redux/eth/selectors';
import Login from '../components/Login';

function Account() {
  const address = useSelector(getAddress);

  if(!address) {
    return (
      <Login />
    );
  }

  return (
    <React.Fragment>
      <Box display={{ xs: 'block', sm: 'none' }} mx="auto">
        <EthIdenticon address={address} scale={1.6}/>
      </Box>
      <Box display={{ xs: 'none', sm: 'block' }} width={200}>
        <AddressField address={address} />
      </Box>
    </React.Fragment>
  );
}

export default Account;
