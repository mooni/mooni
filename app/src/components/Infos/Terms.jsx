import React from 'react';

import { Link, textStyle, GU } from '@aragon/ui'
import { Box } from '@material-ui/core';

import styled from 'styled-components';
import config from "../../config";
import {numberWithCommas} from "../../lib/numbers";
import {dailyLimits, yearlyLimits} from "../../constants/limits";

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
    <Box>
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
        The app is currently only available on the domain at <i>mooni.tech</i>. <br/>
        It is not a money service provider, does not holds any funds, and does not hold any financial license. Instead, it uses different third party services such as a foreign exchange, decentralized liquidity providers and data storages, in order to serve its purpose.
      </Content>
      <SubTitle>
        1.3 Limitations
      </SubTitle>
      <Content>
        Due to our KYC-less process, exchange are subject to some limitations. Each user can cash out up to an equivalent amount of {numberWithCommas(dailyLimits['EUR'])} EUR per day and {numberWithCommas(yearlyLimits['EUR'])} EUR per year. These amounts can vary depending on market conditions and user profiles, and the correct information is available within the app.
      </Content>
      <SubTitle>
        1.4 Third parties
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
        In order to improve the user experience and usabilty of the platform, the software may record some user activity on the website. These data are anonymised and does not contain any private informations. Such collected data can be: public Ethereum blockchain informations, IP address, user agent, network requests, page views, user interactions, errors or order made through the app.
      </Content>
      <SubTitle>
        2.5 Referral system
      </SubTitle>
      <Content>
        App's users can refer other user using the app. If they do so, they can share profit made by these referred users.
        <br/>
        To be eligible to that, referred users must use the link provided on the referrer user's account page. If they don't, it will not be possible to claim profit sharing.
        <br/>
        The amount of profit share is currently set at {config.referralSharing * 100}% of the fees generated by referred users, in Ether (ETH) currency. This is a new and experimental feature, and may be subject to changes in the future.
        <br/>
        Profit sharing has to be manually requested through our support, and will be sent to the referrer user once a reasonable withdrawable amount is available.
      </Content>
    </Box>
  );
}

export default Terms;
