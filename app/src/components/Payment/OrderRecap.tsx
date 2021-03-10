import React from 'react';
import styled from 'styled-components';

import { textStyle, Timer } from '@aragon/ui';
import { Box, Flex } from '@chakra-ui/react';

import {BityTrade, MultiTrade, TradeType} from "../../lib/trading/types";
import { RateAmount } from "../Order/RateAmount";

const Subtitle = styled.h4`
  ${textStyle('label2')};
  color: #585858;
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
`

function RecipientRow({ label, value }) {
  return (
    <Flex justify="space-between" fontSize="0.8rem" mb={1}>
      <Box fontWeight={600}>
        {label}
      </Box>
      <Box textAlign="right" ml="0.5rem" data-private>
        {value}
      </Box>
    </Flex>
  )
}

export default function OrderRecap({ multiTrade }: { multiTrade: MultiTrade }) {
  const bankInfo = multiTrade.bankInfo;
  if(!bankInfo) throw new Error('missing bank info in OrderRecap');
  const {recipient, reference} = bankInfo;

  let fullAddress = '';
  if(recipient.owner?.address) {
    fullAddress += recipient.owner.address;
  }
  if(recipient.owner?.zip) {
    fullAddress += ', ' + recipient.owner.zip;
  }
  if(recipient.owner?.city) {
    fullAddress += ', ' + recipient.owner.city;
  }
  if(recipient.owner?.country) {
    fullAddress += ', ' + recipient.owner.country;
  }

  const bityTrade = multiTrade.trades.find(t => t.tradeType === TradeType.BITY) as BityTrade;
  const orderExpireDate = new Date(bityTrade.bityOrderResponse.timestamp_price_guaranteed);

  return (
    <Box>
      <Box px={2} pb={2}>
        <Box textAlign="center"><Subtitle>Recipient</Subtitle></Box>
        <RecipientRow label="Name" value={recipient.owner.name}/>
        {fullAddress && <RecipientRow label="Address" value={fullAddress}/>}

        <RecipientRow label="IBAN" value={recipient.iban}/>
        {recipient.bic_swift && <RecipientRow label="BIC" value={recipient.bic_swift}/>}
        {reference && <RecipientRow label="Reference" value={reference}/>}
        {recipient.email && <RecipientRow label="Contact email" value={recipient.email}/>}
        {multiTrade.referralId && <RecipientRow label="Referral ID" value={multiTrade.referralId}/>}
      </Box>

      <Flex align="center" direction="column">
        <Subtitle>Exchange</Subtitle>
        <RateAmount multiTradeEstimation={multiTrade}/>
      </Flex>

      <Flex py={4} align="center" direction="column">
        <Subtitle>Price guaranteed for</Subtitle>
        <Timer end={orderExpireDate} />
      </Flex>
    </Box>
  )
}
