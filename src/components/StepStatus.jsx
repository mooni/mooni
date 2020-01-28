import React from 'react';
import { useSelector } from 'react-redux';

import { Box } from '@material-ui/core';
import { Button, IconArrowLeft, IconHome, IconCheck, IconCaution, IconExternal } from '@aragon/ui'

import Loader from '../components/Loader';
import Bity from '../lib/bity';
import { getEtherscanTxURL } from '../lib/eth';

import { getPaymentOrder, getPaymentStatus, getPaymentTransaction } from '../redux/payment/selectors';

function StepStatus({ onBack, onExit }) {
  const paymentStatus = useSelector(getPaymentStatus);
  const paymentOrder = useSelector(getPaymentOrder);
  const paymentTransaction = useSelector(getPaymentTransaction);

  // TODO update bity order
  return (
    <Box width={1} py={3}>
      { paymentStatus ===  'approval' &&
      <Loader text="Please approve transaction" />
      }
      { paymentStatus ===  'check-allowance' &&
      <Loader text="Please approve Uniswap to spend your tokens" />
      }
      { paymentStatus ===  'mining-allowance' &&
      <Loader text="Awaiting allowance mined..." />
      }
      { paymentStatus ===  'mining-payment' &&
      <Loader text="Awaiting transaction mined..." />
      }
      { paymentStatus ===  'mined' &&
      <Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <IconCheck size="large" style={{ color: '#1fbf1f' }} />
        </Box>
        <Box py={2} textAlign="center">
          Transaction sent! <br/>
          The exchange is done and the wire transfer has been initiated. <br/>
          Bank transfers can take several days to arrive, please be patient.
        </Box>
        <Button mode="normal" onClick={onExit} wide icon={<IconHome/>} label="Go home" />
      </Box>
      }
      { paymentStatus ===  'error' &&
      <Box>
        <Box display="flex" justifyContent="center" alignItems="center" color="error.main">
          <IconCaution size="large" />
        </Box>
        <Box py={2} textAlign="center" color="text.primary">
          An error occurred while trying to send the transaction. Please retry later.
        </Box>
        <Button mode="normal" onClick={onBack} wide icon={<IconArrowLeft/>} label="Go back" />
      </Box>
      }

      <Box my={1}>
        {paymentTransaction && <Button href={getEtherscanTxURL(paymentTransaction.hash)} wide icon={<IconExternal/>} label="Open transaction explorer" />}
        <Box mt={1}/>
        {paymentOrder?.bityOrder && <Button href={Bity.getOrderStatusPage(paymentOrder.bityOrder.id)} wide icon={<IconExternal/>} label="Open Bity Order page" />}
      </Box>
    </Box>
  )
}

export default StepStatus;
