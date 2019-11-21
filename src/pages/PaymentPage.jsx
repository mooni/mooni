import React from 'react';
import { useSelector } from 'react-redux';

import { Box } from '@material-ui/core';
import SimpleFiatForm from '../components/SimpleFiatForm';
import { getAddress, getConnect } from '../redux/eth/selectors';

function PaymentPage() {
  const address = useSelector(getAddress);
  const connect = useSelector(getConnect);

  async function onComplete(orderDetail) {
    console.log(orderDetail);
    const { input: { amount }, payment_details: { crypto_address } } = orderDetail;
    await connect.send(crypto_address, amount);
  }

  return (
    <Box width={1} py={3}>
      <Box textAlign="center" width={1}>
        Please enter details about your payment
      </Box>
      <SimpleFiatForm address={address} onComplete={onComplete}/>
    </Box>
  );
}

export default PaymentPage;
