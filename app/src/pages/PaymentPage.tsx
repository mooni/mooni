import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from "styled-components";
import { useHistory } from 'react-router-dom';
import { Box } from '@chakra-ui/react'
import { IconCoin, IconClose } from '@aragon/ui'

import PaymentStatus from '../components/Status/PaymentStatus';
import {RoundButton, Surface, SmallWidth} from '../components/UI/StyledComponents';

import { getMultiTrade, getPayment } from '../redux/payment/selectors';
import {resetOrder, sendPayment, setExchangeStep} from '../redux/payment/actions';
import OrderRecap from "../components/Payment/OrderRecap";
import { Title } from '../components/UI/Typography';

const Root = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #1f1f1f3b;
  backdrop-filter: blur(2px);
  padding: 90px 90px 20px;
  z-index: 3;

  @media (max-width: 960px) {
    padding-bottom: 90px;
  }
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: scroll;
`;


export default function PaymentPage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const multiTrade = useSelector(getMultiTrade);
  const payment = useSelector(getPayment);
  const [paymentState, setPaymentState] = useState<boolean>(false);

  function onRestart() {
    // TODO Cancel order
    dispatch(resetOrder());
    dispatch(setExchangeStep(0));
    history.push('/exchange');
  }

  if(!multiTrade || !payment) {
    history.push('/');
    return <div/>;
  }

  function onSend() {
    setPaymentState(true);
    dispatch(sendPayment());
  }

  return (
    <Root>
      <Container>
        <SmallWidth h="100%">
          <Surface px={4} py={8} mt={4} boxShadow="medium">
            <Title>Payment</Title>
            {paymentState ?
              <PaymentStatus payment={payment} onRestart={onRestart}/>
              :
              <Box>
                <OrderRecap multiTrade={multiTrade} />
                <RoundButton mode="strong" onClick={onSend} wide icon={<IconCoin />} label="Send payment" />
                <Box h={4}/>
                <RoundButton mode="negative" onClick={onRestart} wide icon={<IconClose />} label="Cancel" />
              </Box>
            }
          </Surface>
        </SmallWidth>
      </Container>
    </Root>
  );
}
