import React from 'react';

import { Box, List, ListItem } from '@material-ui/core';
import {
  Button,
  LoadingRing,
  IconArrowLeft,
  IconCheck,
  IconExternal,
  useTheme,
  textStyle,
  IconWarning,
  IconEllipsis,
  GU,
  IconPermissions,
  useViewport,
  Info,
  Help,
} from '@aragon/ui'
import styled from 'styled-components';

import { SimpleLink } from './StyledComponents';

import { getEtherscanTxURL } from '../lib/eth';
import Bity from '../lib/trading/bity';
import { PaymentStatus, PaymentStepId, PaymentStepStatus } from '../lib/types';

const Title = styled.p`
  ${textStyle('title3')};
  text-align: center;
  margin-bottom: ${2 * GU}px;
`;

const SubTitle = styled.p`
  ${textStyle('title4')};
  text-align: center;
  margin-bottom: ${2 * GU}px;
`;

const Hint = styled.p`
  ${textStyle('body3')};
  margin-bottom: ${2 * GU}px;
  text-align: center;
`;
const StatusLabel = styled.p`
  ${textStyle('label2')};
  white-space: nowrap;
`;
const StatusSecondary = styled.p`
  ${textStyle('label2')};
  font-style: italic;
  font-size: 10px;
`;
const ErrorMessage = styled.p`
  ${textStyle('body3')};
`;

const StatusListItem = styled(ListItem)`
  border: 1px solid #f9fafc;
  background-color: #ffffffc9;
  margin-bottom: 6px;
  border-left: 1px solid white;
  padding: 13px;
  border-radius: 11px;
  box-shadow: 1px 1px 7px rgba(145, 190, 195, 0.16);
`;

function PaymentOngoingInfo({ payment }) {
  const ongoing = payment.status === PaymentStatus.ONGOING;
  const bityStep = payment.steps.find(s => s.id === PaymentStepId.BITY);
  const waitingBity = bityStep && bityStep.status === PaymentStepStatus.RECEIVED;
  const miningStep = payment.steps.find(s => s.status === PaymentStepStatus.MINING);

  return (
    <Box>
      {miningStep &&
      <Box mb={2}>
        <Info mode="info">
          Your transaction is validating. Please <b>do not speed up</b> the transaction in your wallet.
        </Info>
      </Box>
      }
      {ongoing && waitingBity ?
        <Hint>
          Your payment have been received and the bank transfer is being sent. This process can take up to 10 minutes.
        </Hint>
        :
        <Info mode="warning">
          Please do not close this tab until the process is complete.
        </Info>
      }
    </Box>
  )
}

function PaymentSuccessInfo() {
  const tweetURL = "https://twitter.com/intent/tweet?text=I've%20just%20cashed%20out%20my%20crypto%20with%20Mooni%20in%20minutes!&via=moonidapp&url=https://app.mooni.tech&hashtags=defi,offramp,crypto";

  return (
    <Box width={1}>
      <SubTitle>
        That's a success <span role="img" aria-label="alright">👌</span>
      </SubTitle>
      <Hint>
        The payment is complete and the bank transfer have been sent. <br/>
        Funds will arrive in you bank account between one hour and one/two days from now, depending on your bank.
      </Hint>
      <Box display="flex" justifyContent="center">
        <SimpleLink href={tweetURL} external>Spread the love <span role="img" aria-label="love">❤️</span></SimpleLink>
      </Box>
    </Box>
  )
}

function getPaymentStepMessage(error) {

  let message = 'Unknown error.';

  if(error.message === 'user-rejected-transaction')
    message = 'You refused the transaction in your wallet.'; else
  if(error.message === 'token-balance-too-low')
    message = 'Your token balance is too low.'; else
  if(error.message === 'bity-order-cancelled')
    message = 'The order have been cancelled by bity. Please go to their order page and contact their support.';

  return message;

}

function PaymentErrorInfo({ onRestart, payment }) {
  const stepsWithError = payment.steps.filter(step => !!step.error);

  return (
    <Box width={1}>
      <SubTitle>
        Oops, something went wrong <span role="img" aria-label="oops">🤭</span>
      </SubTitle>
      {stepsWithError.length > 0 &&
      <>
        <Info mode="error" style={{paddingTop: 0, paddingBottom: 0}}>
          {stepsWithError.map(step => (
            <Box key={step.id} py={1}>
              <StatusLabel>
                {step.id === PaymentStepId.ALLOWANCE && 'Token allowance'}
                {step.id === PaymentStepId.TRADE && 'Token exchange'}
                {step.id === PaymentStepId.PAYMENT && 'Payment'}
                {step.id === PaymentStepId.BITY && 'Fiat exchange'}
              </StatusLabel>
              <ErrorMessage>
                {getPaymentStepMessage(step.error)}
              </ErrorMessage>
            </Box>
          ))}
        </Info>
        <Box mt={2} />
      </>
      }
      <Hint>
        If you think you found a bug, please <SimpleLink href="mailto:support@mooni.tech" external>contact support</SimpleLink>.
      </Hint>
      <Button mode="normal" onClick={onRestart} wide icon={<IconArrowLeft/>} label="Retry" />
    </Box>
  )
}

function ExternalButton({ url, label }) {
  const { below } = useViewport();
  const theme = useTheme();

  let display = 'all';
  const style = {};
  if(below('medium')) {
    display = 'icon';
    style.width = '50px';
  } else {
    style.width = '110px';
  }

  return (
    <Button href={url} style={style} size="mini" display={display} icon={<IconExternal style={{color: theme.accent}}/>} label={label} />
  )
}

function StatusRow({ id, status, txHash, bityOrderId }) {
  const theme = useTheme();

  let color;
  if(status === PaymentStepStatus.DONE) color = theme.positive;
  if(status === PaymentStepStatus.ERROR) color = theme.negative;
  if(status === PaymentStepStatus.APPROVAL) color = theme.infoSurfaceContent;
  if(status === PaymentStepStatus.QUEUED) color = theme.disabledContent;
  if(status === PaymentStepStatus.MINING) color = theme.warningSurfaceContent;
  if(status === PaymentStepStatus.WAITING) color = theme.warningSurfaceContent;
  if(status === PaymentStepStatus.RECEIVED) color = theme.warningSurfaceContent;

  let borderLeftColor;
  if(status === PaymentStepStatus.DONE) borderLeftColor = '#9de2c9';
  if(status === PaymentStepStatus.ERROR) borderLeftColor = theme.negative;
  if(status === PaymentStepStatus.APPROVAL) borderLeftColor = theme.infoSurfaceContent;
  if(status === PaymentStepStatus.QUEUED) borderLeftColor = '#c8d7e4';
  if(status === PaymentStepStatus.MINING) borderLeftColor = '#ead4ae';
  if(status === PaymentStepStatus.WAITING) borderLeftColor = '#ead4ae';
  if(status === PaymentStepStatus.RECEIVED) borderLeftColor = '#ead4ae';

  let backgroundColor = theme.surface;
  if(status === PaymentStepStatus.DONE) backgroundColor = '#f1fbf8';

  return (
    <StatusListItem disableGutters style={{ borderLeftColor, backgroundColor }}>
      <Box display="flex" width={1} alignItems="center">
        <Box width={24} mr={1} display="flex" justifyContent="center">
          {status === PaymentStepStatus.MINING && <LoadingRing/>}
          {status === PaymentStepStatus.WAITING && <LoadingRing/>}
          {status === PaymentStepStatus.RECEIVED && <LoadingRing/>}
          {status === PaymentStepStatus.DONE && <IconCheck size="medium" style={{ color }}/>}
          {status === PaymentStepStatus.ERROR && <IconWarning size="medium" style={{ color }}  />}
          {status === PaymentStepStatus.APPROVAL && <IconPermissions size="medium" style={{ color }}  />}
          {status === PaymentStepStatus.QUEUED && <IconEllipsis size="medium" style={{ color }}  />}
        </Box>
        <Box flex={1} display="flex">
          <StatusLabel>
            {id === PaymentStepId.ALLOWANCE && 'Token allowance'}
            {id === PaymentStepId.TRADE && 'Token exchange'}
            {id === PaymentStepId.PAYMENT && 'Payment'}
            {id === PaymentStepId.BITY && 'Fiat exchange'}
          </StatusLabel>
          <Box display="flex" alignItems="center" ml={1}>
            <StatusSecondary>
              {status === PaymentStepStatus.MINING && <span style={{ color }}>Mining</span>}
              {status === PaymentStepStatus.WAITING && <span style={{ color }}>Confirming</span>}
              {status === PaymentStepStatus.RECEIVED && <span style={{ color }}>Sending</span>}
              {status === PaymentStepStatus.ERROR && <span style={{ color }}>Error</span>}
              {status === PaymentStepStatus.APPROVAL && <span style={{ color }}>Approval</span>}
            </StatusSecondary>
            {status === PaymentStepStatus.APPROVAL &&
            <Box ml={1}>
              <Help hint="What does that mean ?">
                We are waiting for you to accept a transaction in your Ethereum wallet.
              </Help>
            </Box>
            }
          </Box>
        </Box>
        {txHash &&
        <ExternalButton url={getEtherscanTxURL(txHash)} label="Transaction" />
        }
        {bityOrderId &&
        <ExternalButton url={Bity.getOrderStatusPageURL(bityOrderId)} label="Bity order" />
        }
      </Box>
    </StatusListItem>
  )
}

export default function PaymentStatusComponent({ payment, onRestart }) {
  return (
    <Box width={1}>
      <Title>
        Order status
      </Title>

      <Box mb={2}>
        <List>
          {payment.steps.map(step =>
            <StatusRow key={step.id} id={step.id} status={step.status} txHash={step.txHash} bityOrderId={step.bityOrderId} />
          )}
        </List>
      </Box>

      {payment.status === PaymentStatus.ONGOING && <PaymentOngoingInfo payment={payment}/>}
      {payment.status === PaymentStatus.ERROR && <PaymentErrorInfo onRestart={onRestart} payment={payment} />}
      {payment.status === PaymentStatus.DONE && <PaymentSuccessInfo />}
    </Box>
  )
}
