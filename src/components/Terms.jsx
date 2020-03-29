import React from 'react';

import { Info, Link, textStyle, GU } from '@aragon/ui'
import { Box } from '@material-ui/core';

import styled from 'styled-components';


export const Title = styled.p`
  ${textStyle('title3')};
   margin-bottom: ${3 * GU}px;
`;
export const SubTitle = styled.p`
  ${textStyle('title4')};
  margin-bottom: ${2 * GU}px;
`;
export const Content = styled.p`
  ${textStyle('body1')};
  margin-bottom: ${1 * GU}px;
`;

function Terms() {
  return (
    <Box pt={4}>
      <Title>
        Terms and conditions
      </Title>
      <SubTitle>
        1.1 Object
      </SubTitle>
      <Content>
        This terms and condition applies between <b>Mooni</b>, which is an open source software, and a <b>user</b>, which is the person that use this software.
      </Content>
      <SubTitle>
        1.2 Service
      </SubTitle>
      <Content>
        Mooni is a web application that allows to transfer funds from a crypto wallet to a bank account. <br/>
        It is not a money service provider, and does not hold any financial license. Instead, it uses different third party services such as a foreign exchange, decentralized liquidity providers and data storages, in order to serve its purpose.
      </Content>
      <SubTitle>
        1.3 Third parties
      </SubTitle>
      <Content>
        Mooni make the use of the following third party services: <Link href="https://bity.com" external>Bity</Link>, <Link href="https://uniswap.org" external>Uniswap</Link>, <Link href="https://3box.io" external>3Box</Link>.<br/>
        By accepting this terms, the user also accept all the terms of the third party services, notably the <Link href="https://bity.com/legal/" external>terms of Bity</Link>, which is responsible of the crypto->fiat exchange. <br/>
        Notably, the user acknoledge that the financial transactions executed are legally acceptable. This acceptability is determined by Bity own rules.
      </Content>
      <SubTitle>
        2.1 Experimental
      </SubTitle>
      <Content>
        By using this software, the user acknowledge that they are using open source experimental software which is provided as is and is under heavy development.<br/>
        There may be bugs and undesired behaviour, that may result in a loss of funds, and the well execution of the software is not guaranteed.
      </Content>
      <SubTitle>
        2.2 Limitation of liability
      </SubTitle>
      <Content>
        The open source contributors of this software deny all responsibility if a bug happens or if any funds are lost because of the use of this software.
      </Content>
      <SubTitle>
        2.3 Provided support
      </SubTitle>
      <Content>
        In case of a bug or lost funds, the users can get help by <Link href="mailto:usemooni@gmail.com" external>contacting the contributors</Link> of this project, or by directly contacting Bity, but nothing is guaranteed in terms of response or funds recovery.
      </Content>
    </Box>
  );
}

export default Terms;
