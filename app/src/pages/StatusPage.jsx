import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import PaymentStatus from '../components/Status/PaymentStatus';
import { SmallWidth } from '../components/UI/StyledComponents';

import { getPayment } from '../redux/payment/selectors';
import { resetOrder, setExchangeStep } from '../redux/payment/actions';

export default function OrderStatusContainer() {
  const history = useHistory();
  const dispatch = useDispatch();

  const payment = useSelector(getPayment);

  function onRestart() {
    dispatch(resetOrder());
    dispatch(setExchangeStep(0));
    history.push('/exchange');
  }

  if(!payment) {
    history.push('/');
    return <div/>;
  }

  return (
    <SmallWidth>
      <PaymentStatus payment={payment} onRestart={onRestart}/>
    </SmallWidth>
  );
}
