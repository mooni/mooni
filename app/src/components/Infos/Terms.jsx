import React from 'react';

import { Link, textStyle, GU } from '@aragon/ui'
import { Box } from '@material-ui/core';

import styled from 'styled-components';

export const SubTitle = styled.p`
  ${textStyle('title4')};
  margin-bottom: ${2 * GU}px;
`;
export const Content = styled.p`
  ${textStyle('body2')};
  margin-bottom: ${1 * GU}px;
`;

function Terms() {
  return (
    <Box pt={6} pb={6}>
      <SubTitle>
        1.1 Object
      </SubTitle>
      <Content>
        This terms and conditions applies between <b>Mooni</b>, which is an open source software, provided as a web platform, and a <b>user</b>, which is the person that use this platform.
      </Content>
      <SubTitle>
        1.2 Service
      </SubTitle>
      <Content>
        Mooni is a web application that allows to transfer funds from a crypto wallet to a bank account. <br/>
        It is not a money service provider, does not holds any funds, and does not hold any financial license. Instead, it uses different third party services such as a foreign exchange, decentralized liquidity providers and data storages, in order to serve its purpose.
      </Content>
      <SubTitle>
        1.3 Third parties
      </SubTitle>
      <Content>
        Mooni make the use of the following third party services: <Link href="https://bity.com" external>Bity</Link>, <Link href="https://paraswap.io" external>Paraswap</Link>, <Link href="https://3box.io" external>3Box</Link>.<br/>
        By accepting this terms, the user also accept all the terms of the third party services, notably the <Link href="https://bity.com/legal/" external>terms of Bity</Link>, which is responsible of the crypto-to-fiat exchange. <br/>
        Notably, the user acknowledge that the financial transactions executed are legally acceptable. This acceptability is determined by Bity own rules.
      </Content>
      <SubTitle>
        2.1 Experimental product
      </SubTitle>
      <Content>
        By using this software, the user acknowledge that they are using open source experimental software. The platform, its software and all content found on it are provided on an “as is” and “as available” basis.<br/>
        The open source contributors of this software do not give any warranties, whether express or implied, as to the suitability or usability of the website, its software or any of its content.<br/>
      </Content>
      <SubTitle>
        2.2 Limitation of liability
      </SubTitle>
      <Content>
        The open source contributors of this software will not be liable for any loss, whether such loss is direct, indirect, special or consequential, suffered by any party as a result of their use of the Mooni platform, its software or content. Any transactions on the website are done at the user’s own risk and the user will be solely responsible for any damage to any computer system or loss of data or funds that results from such activities.
      </Content>
      <SubTitle>
        2.3 Provided support
      </SubTitle>
      <Content>
        In case of a bug or lost funds, the users can get help by <Link href="mailto:contact@mooni.tech" external>contacting the contributors</Link> of this project, or by directly contacting Bity, but nothing is guaranteed in terms of response or funds recovery. <br/>
        Should you encounter any bugs, glitches, lack of functionality or other problems on the website, please let us know immediately so we can rectify these accordingly.
      </Content>
      <SubTitle>
        2.4 User data
      </SubTitle>
      <Content>
        In order to improve the user experience and usabilty of the platform, the software may record some user activity on the website. These data are anonymised and does not contain any private informations. Such collected data can be: IP address, user agent, network requests, page views, user interactions, errors or order statuses.
      </Content>
    </Box>
  );
}

export default Terms;
