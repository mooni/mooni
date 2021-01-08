import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import RequireConnection from '../components/RequireConnection';
import PaymentStatus from '../components/PaymentStatus';
import { SmallWidth } from '../components/StyledComponents';

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
    <RequireConnection>
      {() =>
        <SmallWidth>
          <PaymentStatus payment={payment} onRestart={onRestart}/>
        </SmallWidth>
      }
    </RequireConnection>
  );
}
