import React, { useState, useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';

import { useHistory } from 'react-router-dom';

import Loader from '../components/Loader';
import PaymentStatus from '../components/PaymentStatus';
import { SmallWidth } from '../components/StyledComponents';

import Bity from '../lib/bity';

import { getOrder, getPayment } from '../redux/payment/selectors';
import { resetOrder, setExchangeStep } from '../redux/payment/actions';

const POLL_INTERVAL = 2000;

function useUpdatedOrder(orderId, paymentStatus) {
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if(!orderId) return;

    let intervalId;

    function fetchNewData() {
      Bity.getOrderDetails(orderId)
        .then(newOrderDetails => {
          setOrderDetails(newOrderDetails);
          if(newOrderDetails.orderStatus === 'executed' || newOrderDetails.orderStatus === 'cancelled') {
            clearInterval(intervalId);
          }
        })
        .catch(console.error);
    }
    fetchNewData();

    if(paymentStatus === 'mined')
      intervalId = setInterval(fetchNewData, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [orderId, paymentStatus]);

  return orderDetails;
}

export default function OrderStatusContainer() {
  const history = useHistory();
  const dispatch = useDispatch();

  const order = useSelector(getOrder);
  const payment = useSelector(getPayment);

  const orderDetails = useUpdatedOrder(order?.bityOrder?.id /* TODO , paymentStatus */);

  if(!order || !payment) {
    history.push('/');
    return <div/>;
  }

  function onRestart() {
    dispatch(resetOrder());
    dispatch(setExchangeStep(0));
    history.push('/exchange');
  }
  function onExit() {
    history.push('/');
  }

  if(!orderDetails) {
    return (
      <Loader text="Loading order status..." />
    )
  }

  return (
    <SmallWidth>
      <PaymentStatus payment={payment}/>
    </SmallWidth>
  );
}
