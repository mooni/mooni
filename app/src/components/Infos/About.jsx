import React from 'react';
import GitHubButton from 'react-github-btn';

import { Link, textStyle, GU } from '@aragon/ui'
import { Box } from '@material-ui/core';
import styled from 'styled-components';
import { Twitter, Email } from '@material-ui/icons';
import DiscordIcon from '../../assets/discord_icon.svg';

import config from '../../config';

const Title = styled.p`
  ${textStyle('body1')};
  text-align: center;
`;
const SubTitle = styled.p`
  ${textStyle('body4')};
  margin-top: ${2 * GU}px;
  margin-bottom: ${2 * GU}px;
  text-align: center;
`;
const Header = styled.p`
  ${textStyle('title4')};
  text-align: center;
  margin-bottom: ${1 * GU}px;
`;
const Content = styled.p`
  ${textStyle('body2')};
  text-align: center;
  margin-bottom: ${4 * GU}px;
`;
const SocialIcon = styled.a`
  margin: 0 ${1 * GU}px;
`;

export default function AboutPage() {
  return (
    <Box>
      <Title>
        Mooni is a web application allowing to transfer funds from a crypto wallet to a bank account.
      </Title>
      <SubTitle>
        Want to see how it works ? Check out the <Link href="https://doc.mooni.tech/walkthrough" external style={{ textDecoration: 'none' }}>Walkthrough</Link> !
      </SubTitle>
      <Header>
        Availability
      </Header>
      <Content>
        Mooni can only transfer funds in Euro (EUR) and Swiss Franc (CHF) to bank accounts in the <Link href="https://www.ecb.europa.eu/paym/integration/retail/sepa/html/index.en.html" style={{ textDecoration: 'none' }} external>SEPA network</Link>.
        <br/>The following banks are known to refuse payments from our service: <i style={{color: '#881111'}}>Payoneer, Transferwise</i>
      </Content>
      <Header>
        Integration
      </Header>
      <Content>
        It is possible to integrate Mooni into any applications. Please refer to
        <Link href="https://doc.mooni.tech" external style={{ textDecoration: 'none' }}>
          &nbsp;the documentation&nbsp;
        </Link>
        for more informations.
      </Content>
      <Header>
        Social
      </Header>
      <Box display="flex" justifyContent="center" my={1}>
        <SocialIcon href="https://twitter.com/moonidapp" target="_blank">
          <Twitter fontSize="large" />
        </SocialIcon>
        <SocialIcon href={config.discordInviteUrl} target="_blank" rel="noopener noreferrer">
          <img src={DiscordIcon} width={30} alt="discord icon" />
        </SocialIcon>
        <SocialIcon href="mailto:contact@mooni.tech" target="_blank">
          <Email fontSize="large" />
        </SocialIcon>
      </Box>
      <SubTitle>
        Mooni is open-source !
      </SubTitle>
      <Box display="flex" justifyContent="center" mt={1}>
        <GitHubButton href="https://github.com/pakokrew/mooni" data-color-scheme="no-preference: dark; light: dark; dark: dark;">Github</GitHubButton>
      </Box>
    </Box>
  );
}
