import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from "styled-components";
import { useHistory } from 'react-router-dom';
import { Box, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button } from '@chakra-ui/react'
import { IconCoin, IconClose } from '@aragon/ui'

import PaymentStatus from '../components/Status/PaymentStatus';
import {RoundButton, Surface} from '../components/UI/StyledComponents';

import { getMultiTrade, getPayment } from '../redux/payment/selectors';
import {resetOrder, sendPayment, setExchangeStep} from '../redux/payment/actions';
import OrderRecap from "../components/Payment/OrderRecap";
import { Title } from '../components/UI/Typography';

const Root = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-color: #b1aeae5c;
  backdrop-filter: blur(2px);
  z-index: 1400;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScrollContainer = styled.div`
  height: 100%;
  padding: 70px 20px 40px;
  width: 28rem;
  overflow: scroll;
`;

function ConfirmCancel({isOpen, onCancel, onClose}) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Cancel order
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to cancel this order ?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Nevermind
            </Button>
            <Button colorScheme="red" variant="solid" onClick={onCancel} ml={3}>
              Cancel order
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default function PaymentPage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const multiTrade = useSelector(getMultiTrade);
  const payment = useSelector(getPayment);
  const [paymentState, setPaymentState] = useState<boolean>(true);
  const [alertCancel, setAlertCancel] = React.useState<boolean>(false)


  if(!multiTrade || !payment) {
    history.push('/');
    return <div/>;
  }

  function onSend() {
    setPaymentState(true);
    dispatch(sendPayment());
  }

  function onRestart(home: boolean = false) {
    // TODO Cancel order
    dispatch(resetOrder());
    dispatch(setExchangeStep(0));
    history.push(home ? '/' : '/exchange');
  }

  return (
    <Root>
      <ScrollContainer>
        <Surface px={4} py={8} boxShadow="medium">
          <Title>Payment</Title>
          {paymentState ?
            <PaymentStatus payment={payment} onRestart={onRestart}/>
            :
            <Box>
              <OrderRecap multiTrade={multiTrade} />
              <RoundButton mode="strong" onClick={onSend} wide icon={<IconCoin />} label="Send payment" />
              <Box h={4}/>
              <RoundButton mode="negative" onClick={() => setAlertCancel(true)} wide icon={<IconClose />} label="Cancel" />
              <ConfirmCancel isOpen={alertCancel} onClose={() => setAlertCancel(false)} onCancel={onRestart}/>
            </Box>
          }
        </Surface>
      </ScrollContainer>
    </Root>
  );
}
