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
} from '@aragon/ui'
import styled from 'styled-components';

import { SimpleLink } from './StyledComponents';

import { getEtherscanTxURL } from '../lib/eth';
import Bity from '../lib/bity';

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
`;
const StatusSecondary = styled.p`
  ${textStyle('label2')};
  display: flex;
`;
const ExternalButton = styled(Button)`
  width: 110px;
`;

function OngoingMessage() {
  return (
    <Hint>
      You will be prompted to accept transactions in your ethereum wallet. Please do not close this tab until the order is complete.
    </Hint>
  )
}

function SuccessMessage() {
  const tweetURL = "https://twitter.com/intent/tweet?text=I've%20just%20cashed%20out%20my%20crypto%20with%20Mooni%20in%20minutes!&via=moonidapp&url=https://app.mooni.tech&hashtags=defi,offramp,crypto";

  return (
    <Box width={1}>
      <SubTitle>
        That's a success 👌
      </SubTitle>
      <Hint>
        The payment is complete and the bank transfer have been sent. <br/>
        Funds will arrive in you bank account between one hour and one/two days from now, depending on your bank.
      </Hint>
      <Box display="flex" justifyContent="center">
        <SimpleLink href={tweetURL} external>Spread the love ❤️</SimpleLink>
      </Box>
    </Box>
  )
}

function ErrorMessage() {
  return (
    <Box width={1}>
      <SubTitle>
        Oops, something went wrong 🤭
      </SubTitle>
      <Hint>
        An error occurred while trying to send the transaction. <br/>
        You may have denied transactions in your wallet. <br/>
        If you think you found a bug, please <SimpleLink href="mailto:support@mooni.tech" external>contact support</SimpleLink>.
      </Hint>
      <Button mode="normal" wide icon={<IconArrowLeft/>} label="Retry" />
    </Box>
  )
}

function StatusRow({ status, label, txHash, bityOrderId }) {
  const theme = useTheme();

  return (
    <ListItem>
      <Box display="flex" width={1} alignItems="center">
        <Box width={24} mr={1} display="flex" justifyContent="center">
          {status === 'mining' && <LoadingRing/>}
          {status === 'done' && <IconCheck size="medium" style={{ color: theme.positive }}/>}
          {status === 'error' && <IconWarning size="medium" style={{ color: theme.negative }}  />}
          {status === 'approval' && <IconPermissions size="medium" style={{ color: theme.infoSurfaceContent }}  />}
          {status === 'queued' && <IconEllipsis size="medium" style={{ color: theme.disabledContent }}  />}
        </Box>
        <Box flex={1}>
          <StatusLabel>
            {label}
          </StatusLabel>
        </Box>
        <Box ml={1} alignSelf="flex-end">
          <StatusSecondary>
            {status === 'mining' && <span style={{color: theme.warningSurfaceContent}}>Mining</span>}
            {status === 'error' && <span style={{color: theme.negative}}>Error</span>}
            {status === 'approval' && <span style={{color: theme.infoSurfaceContent}}>Approval</span>}
          </StatusSecondary>
          {txHash &&
          <ExternalButton href={getEtherscanTxURL(txHash)} size="mini" icon={<IconExternal style={{color: theme.accent}}/>} label="Transaction" />
          }
          {bityOrderId &&
          <ExternalButton href={Bity.getOrderStatusPageURL(bityOrderId)} size="mini" icon={<IconExternal style={{color: theme.accent}}/>} label="Bity order" />
          }
        </Box>
      </Box>
    </ListItem>
  )
}

export default function OrderStatus() {
  return (
    <Box width={1}>
      <Title>
        Order status
      </Title>

      <Box mx={2} mb={2}>
        <List>
            <StatusRow status="done" label="Token allowance" txHash="dfeif"/>
            <StatusRow status="done" label="Token allowance" txHash="dfeif"/>
            <StatusRow status="done" label="Token allowance" txHash="dfeif"/>
            <StatusRow status="done" label="Token allowance" txHash="dfeif"/>
            <StatusRow status="done" label="Token allowance" txHash="dfeif"/>
            {/*<StatusRow status="approval" label="Token exchange" />*/}
            {/*<StatusRow status="mining" label="Payment" />*/}
            {/*<StatusRow status="error" label="Payment" />*/}
            {/*<StatusRow status="queued" label="Fiat exchange" bityOrderId={orderDetails.id}/>*/}
        </List>
      </Box>

      {/*<OngoingMessage/>*/}
      {/*<ErrorMessage/>*/}
      <SuccessMessage/>
    </Box>
  )
}
