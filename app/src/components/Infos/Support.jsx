import React from 'react';
import styled from 'styled-components';

import { Box } from '@material-ui/core';
import { textStyle, Link, GU } from '@aragon/ui';
import config from '../../config';

const SubTitle = styled.p`
  ${textStyle('title4')};
  text-align: center;
  margin-top: ${2 * GU}px;
`;
const FaqSection = styled.p`
  ${textStyle('body2')};
  text-align: center;
  margin-top: ${2 * GU}px;
  margin-bottom: ${2 * GU}px;
`;

const Content = styled.p`
  ${textStyle('body3')};
  text-align: center;
`;

export default function Support() {
  return (
    <Box pt={3}>
      <Content>
        If you have any problem or suggestion, feel free to contact us.
        <br/>
        The prefered way of communication is on our
        <Link href={config.discordInviteUrl} external style={{ textDecoration: 'none' }}>
          &nbsp;Discord server
        </Link>.
        You can also
        <Link href="mailto:contact@mooni.tech" external style={{ textDecoration: 'none' }}>
          &nbsp;reach us by mail
        </Link>.
      </Content>

      <SubTitle>
        FAQ
      </SubTitle>

      <FaqSection>
        My order is displayed as executed, but I have not received the funds in my bank account
      </FaqSection>
      <Content>
        Bank transfer may take up to 4 <u>working</u> days to settle. Sometimes, it only takes few hours, but most of traditional banks takes few days to process incoming transfers, and they don't work on weekends. Don't worry, and please wait at least 4 days before contacting support regarding that.
      </Content>
      <FaqSection>
        I have sent the payment, but it never get confirmed
      </FaqSection>
      <Content>
        Have you replaced your transaction with higher fees ? It happens sometimes that speeding up transactions generates bug. Please reach out to us and we'll manage to either fix the order or refund you.
      </Content>
      <FaqSection>
        What happens if there is a problem along the way ?
      </FaqSection>
      <Content>
        If there is a problem with your order, or if your bank refuses the incoming transfer, you will be refunded ETH to your address after confirmation from support.
      </Content>
      <FaqSection>
        I do not see some transaction I did more than X months ago
      </FaqSection>
      <Content>
        We did not store order information in previous versions of the app. If you need a full order history, please contact us.
      </Content>
      <FaqSection>
        I have referred users to use Mooni, how can I get a profit sharing ?
      </FaqSection>
      <Content>
        To be able to earn profit sharing, referred user must have successfully completed orders. If they did, please contact our support to know your available balance and ask for a withdrawal. This is a new feature, and automatic withdrawal request will be available once there is enough demand.
      </Content>
    </Box>
  );
}
