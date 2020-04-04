import React from 'react';
import GitHubButton from 'react-github-btn';

import { Link, textStyle, GU } from '@aragon/ui'
import { Box } from '@material-ui/core';
import styled from 'styled-components';
import { Twitter, Telegram, Email } from '@material-ui/icons';
import { MediumWidth } from '../components/StyledComponents';

const Title = styled.p`
  ${textStyle('title2')};
  text-align: center;
  margin-bottom: ${1 * GU}px;
`;
const Header = styled.p`
  ${textStyle('title4')};
  text-align: center;
  margin-top: ${2 * GU}px;
  margin-bottom: ${1 * GU}px;
`;
const Content = styled.p`
  ${textStyle('body2')};
  text-align: center;
`;
const SocialIcon = styled.a`
  margin: 0 ${1 * GU}px;
`;

export default function AboutPage() {
  return (
    <MediumWidth>
      <Box pt={2}>
        <Title>
          About
        </Title>
        <Content>
          Mooni is a web application allowing to transfer funds from a crypto wallet to a bank account.
        </Content>
        <Header>
          Availability
        </Header>
        <Content>
          As of today, Mooni can only transfer funds in Euro (EUR) and Swiss Franc (CHF) to European bank accounts.
        </Content>
        <Header>
          Integration
        </Header>
        <Content>
          It is possible to integrate Mooni into any applications. Please refer to
          <Link href="https://github.com/pakokrew/mooni#-Frontend-integration" external style={{ textDecoration: 'none' }}>
            &nbsp;the documentation&nbsp;
          </Link>
          for more informations.
        </Content>
        <Header>
          Support
        </Header>
        <Content>
          If you have any problem or suggestion, please contact us on one of the following socials.
        </Content>
        <Header>
          Social
        </Header>
        <Box display="flex" justifyContent="center" mt={1}>
          <SocialIcon href="https://twitter.com/moonidapp" target="_blank">
            <Twitter fontSize="large" />
          </SocialIcon>
          <SocialIcon href="https://t.me/moonidapp" target="_blank">
            <Telegram fontSize="large" />
          </SocialIcon>
          <SocialIcon href="mailto:contact@mooni.tech" target="_blank">
            <Email fontSize="large" />
          </SocialIcon>
        </Box>

        <Content>
          Mooni is open-source !
        </Content>
        <Box display="flex" justifyContent="center" mt={1}>
          <GitHubButton href="https://github.com/pakokrew/mooni" data-color-scheme="no-preference: dark; light: dark; dark: dark;">Github</GitHubButton>
        </Box>
      </Box>
    </MediumWidth>
  );
}
