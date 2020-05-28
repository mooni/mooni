import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box } from '@material-ui/core';
import { Button, Info, IconCoin, Checkbox, Link } from '@aragon/ui'

import Loader from '../components/Loader';
import OrderRecap from '../components/OrderRecap';

import { getOrder, getOrderErrors } from '../redux/payment/selectors';
import { setInfoPanel } from '../redux/ui/actions';

function StepRecap({ onComplete }) {
  const dispatch = useDispatch();
  const order = useSelector(getOrder);
  const orderErrors = useSelector(getOrderErrors);

  const [termsAccepted, setTermsAccepted] = useState(false);

  if(orderErrors) {
    return (
      <Box width={1}>
        <Info title="Order error" mode="error">
          {orderErrors.map(error => (
            <Box key={error.code}><b>{error.code}</b> {error.message}</Box>
          ))}
        </Info>
      </Box>
    );
  }

  if(!order) {
    return (
      <Loader text="Creating order ..." />
    );
  }

  const now = new Date();
  const orderExpireDate = new Date(order.bityOrder.timestamp_price_guaranteed);

  if(orderExpireDate < now) {
    return (
      <Box width={1}>
        <Info title="Order expired" mode="error">
          The order you made has expired. Please create a new one.
        </Info>
      </Box>
    )
  }

  return (
    <Box width={1}>
      <OrderRecap order={order} />
      <Box py={2} display="flex" justifyContent="center">
        <label>
          <Checkbox
            checked={termsAccepted}
            onChange={setTermsAccepted}
          />
          I agree with the <Link onClick={() => dispatch(setInfoPanel('terms'))}>terms of service</Link>
        </label>
      </Box>
      <Button mode="strong" onClick={onComplete} wide icon={<IconCoin />} disabled={!termsAccepted} label="Send payment" />
    </Box>
  )
}

export default StepRecap;
