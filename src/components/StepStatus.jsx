import React from 'react';
import { useSelector } from 'react-redux';

import { Box } from '@material-ui/core';
import { Button, IconArrowLeft, IconHome, IconCheck } from '@aragon/ui'

import Loader from '../components/Loader';

import { getPaymentStatus } from '../redux/payment/selectors';

function StepStatus({ onBack, onExit }) {
  const paymentStatus = useSelector(getPaymentStatus);

  // TODO update bity order
  return (
    <Box width={1} py={3}>
      { paymentStatus ===  'approval' &&
      <Loader text="Awaiting transaction approval..." />
      }
      { paymentStatus ===  'pending' &&
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
        <Box py={2} textAlign="center" color="secondary.main">
          An error occurred while trying to send the transaction. Please retry later.
        </Box>
        <Button mode="normal" onClick={onBack} wide icon={<IconArrowLeft/>} label="Go back" />
      </Box>
      }
    </Box>
  )
}

export default StepStatus;
