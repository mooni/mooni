import React from 'react'
import GitHubButton from 'react-github-btn'

import { Link, textStyle, GU } from '@aragon/ui'
import { VStack, Image, Flex } from '@chakra-ui/react'
import styled from 'styled-components'
import { DiscordButton, EmailButton, TwitterButton } from '../UI/Tools'

const Title = styled.p`
  ${textStyle('body1')};
  text-align: center;
`
const AppName = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.14rem;
  font-size: 2.5rem;
  text-align: center;
`
const SubTitle = styled.p`
  ${textStyle('body4')};
  font-size: 0.9rem;
  margin-top: ${2 * GU}px;
  margin-bottom: ${2 * GU}px;
  text-align: center;
`
const Header = styled.p`
  ${textStyle('title4')};
  text-align: center;
  margin-bottom: ${1 * GU}px;
`
const Content = styled.p`
  ${textStyle('body2')};
  text-align: center;
  margin-bottom: ${4 * GU}px;
`

export default function AboutPage() {
  return (
    <Flex direction="column" align="center">
      <Image boxSize={32} mb={4} src="images/logos/logo_blue_bg.svg" />
      <AppName>MOONI</AppName>
      <Title>
        Effortlessly convert cryptocurrencies from your blockchain wallet, into fiat to your bank account, within
        minutes.
      </Title>
      <SubTitle>
        Want to see how it works ? Check out the{' '}
        <Link href="https://doc.mooni.tech/walkthrough" external style={{ textDecoration: 'none' }}>
          Walkthrough
        </Link>{' '}
        !
      </SubTitle>
      <Header>Availability</Header>
      <Content>
        Mooni can only transfer funds in Euro (EUR) and Swiss Franc (CHF) to bank accounts in the{' '}
        <Link
          href="https://www.ecb.europa.eu/paym/integration/retail/sepa/html/index.en.html"
          style={{ textDecoration: 'none' }}
          external
        >
          SEPA network
        </Link>
        .
        <br />
        The following banks are known to refuse payments from our service:{' '}
        <i style={{ color: '#881111' }}>Payoneer, Transferwise</i>
      </Content>
      <Header>Integration</Header>
      <Content>
        It is possible to integrate Mooni into any applications. Please refer to
        <Link href="https://doc.mooni.tech" external style={{ textDecoration: 'none' }}>
          &nbsp;the documentation&nbsp;
        </Link>
        for more informations.
      </Content>
      <Header>Social</Header>
      <VStack spacing="0.5rem">
        <DiscordButton label="Join us on Discord" />
        <TwitterButton label="Follow us on Twitter" />
        <EmailButton label="Send a mail" />
      </VStack>
      <SubTitle>Mooni is open-source !</SubTitle>
      <Flex justify="center" mt={1}>
        <GitHubButton
          href="https://github.com/pakokrew/mooni"
          data-color-scheme="no-preference: dark; light: dark; dark: dark;"
        >
          Github
        </GitHubButton>
      </Flex>
    </Flex>
  )
}
