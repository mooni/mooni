import React from 'react'
import styled from 'styled-components'

import { Box, Flex } from '@chakra-ui/react'
import { textStyle, GU } from '@aragon/ui'
import { numberWithCommas } from '../../lib/numbers'
import { dailyLimits } from '../../constants/limits'
import { DiscordButton, EmailButton } from '../UI/Tools'

const SubTitle = styled.p`
  ${textStyle('title4')};
  text-align: center;
  margin-top: ${2 * GU}px;
`
const FaqSection = styled.p`
  ${textStyle('body2')};
  text-align: center;
  margin-top: ${2 * GU}px;
  margin-bottom: ${2 * GU}px;
`

const Content = styled.p`
  ${textStyle('body3')};
  text-align: center;
`

export default function Support() {
  return (
    <Box>
      <Content>The preferred way to contact us is through our Discord server.</Content>

      <Flex justify="center" mt={2}>
        <DiscordButton label="Join us on Discord" variant="strong" />
      </Flex>

      <SubTitle>Important informations</SubTitle>
      <Content>
        Please make sure you are using our unique domain name at <u>app.mooni.tech</u>. Mooni will never ask for your
        seed/private keys or ever contact you by email.
      </Content>

      <SubTitle>FAQ</SubTitle>

      <FaqSection>My order is displayed as executed, but I have not received the funds in my bank account</FaqSection>
      <Content>
        Bank transfer may take up to 4 <u>working</u> days to settle. Sometimes, it only takes few hours, but most of
        traditional banks takes few days to process incoming transfers, and they don't work on weekends. Don't worry,
        and please wait at least 4 days before contacting support regarding that.
      </Content>
      <FaqSection>The app say I have reached the limit, what can I do ?</FaqSection>
      <Content>
        Due to our KYC-less process, exchange are subject to limitations approximately equivalent to an amount of{' '}
        {numberWithCommas(dailyLimits['EUR'])} EUR per day. You can split your transaction among different days. If you
        think you haven't consumed that much but still cannot checkout in the app, please contact support.
      </Content>
      <FaqSection>I have sent the payment, but it never get confirmed</FaqSection>
      <Content>
        Have you replaced your transaction with higher fees ? It happens sometimes that speeding up transactions
        generates bug. Please reach out to us and we'll manage to either fix the order or refund you.
      </Content>
      <FaqSection>What happens if there is a problem along the way ?</FaqSection>
      <Content>
        If there is a problem with your order, or if your bank refuses the incoming transfer, you will be refunded ETH
        to your address after confirmation from support.
      </Content>
      <FaqSection>I do not see some transaction I did more than X months ago</FaqSection>
      <Content>
        We did not store order information in previous versions of the app. If you need a full order history, please
        contact us.
      </Content>
      <FaqSection>I have referred users to use Mooni, how can I get a profit sharing ?</FaqSection>
      <Content>
        To be able to earn profit sharing, referred user must have successfully completed orders. If they did, please
        contact our support to know your available balance and ask for a withdrawal. This is a new feature, and
        automatic withdrawal request will be available once there is enough demand. Payments will be made in Ether (ETH)
        currency.
      </Content>

      <SubTitle>Not found your answer ?</SubTitle>

      <Flex justify="center" mt={2}>
        <EmailButton label="Reach us by mail" />
      </Flex>
    </Box>
  )
}
