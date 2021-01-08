import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box } from '@material-ui/core';
import { Button, Info, IconCoin, IconRefresh, Checkbox, Link } from '@aragon/ui'
import { Button as MButton } from '@material-ui/core';

import Loader from '../components/Loader';
import OrderRecap from './OrderRecap';

import { getMultiTrade, getOrderErrors } from '../redux/payment/selectors';
import { setInfoPanel } from '../redux/ui/actions';
import {BityTrade, TradeType} from "../lib/trading/types";
import { createOrder } from '../redux/payment/actions'

function StepRecap({ onComplete }) {
  const dispatch = useDispatch();
  const multiTrade = useSelector(getMultiTrade);
  const orderErrors = useSelector(getOrderErrors);

  const [termsAccepted, setTermsAccepted] = useState(false);

  if(orderErrors) {
    return (
      <Box width={1}>
        <Info title="Order error" mode="error">
          {orderErrors.map(error => (
            <Box key={error.code}>
              <b>{error.code}</b> {error.message}
            </Box>
          ))}
        </Info>
        {orderErrors.find(e => e.code === 'timeout') &&
        <Box mt={2}>
          <MButton
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<IconRefresh/>}
            style={{width: '100%'}}
            onClick={() => dispatch(createOrder())}
            >
              Retry
            </MButton>
          </Box>
        }
      </Box>
    );
  }

  if(!multiTrade) {
    return (
      <Loader text="Creating order ..." />
    );
  }

  const now = new Date();
  const bityTrade = multiTrade.trades.find(t => t.tradeType === TradeType.BITY) as BityTrade;
  const orderExpireDate = new Date(bityTrade.bityOrderResponse.timestamp_price_guaranteed);

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
      <OrderRecap multiTrade={multiTrade} />
      <Box py={2} display="flex" justifyContent="center">
        <Checkbox
          checked={termsAccepted}
          onChange={setTermsAccepted}
        />
        <label>
          I agree with the <Link onClick={() => dispatch(setInfoPanel('terms'))}>terms of service</Link>
        </label>
      </Box>
      <Button mode="strong" onClick={onComplete} wide icon={<IconCoin />} disabled={!termsAccepted} label="Send payment" />
    </Box>
  )
}

export default StepRecap;
