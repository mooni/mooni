import React from 'react';
import styled from 'styled-components';

import { Box, Grid } from '@material-ui/core';
import { textStyle, GU } from '@aragon/ui';

import RequireConnection from "../components/Utils/RequireConnection";
import OrderHistory from '../components/Account/OrderHistory';
import ReferralInfo from '../components/Account/ReferralInfo';
import AccountInfo from '../components/Account/AccountInfo';

const Title = styled.p`
  ${textStyle('title2')};
  margin-bottom: ${2 * GU}px;
`;

const SubTitle = styled.p`
  ${textStyle('title4')};
  margin-top: ${2 * GU}px;
  margin-bottom: ${2 * GU}px;
`;


export default function AccountPage() {
  return (
    <RequireConnection>
      {() =>
        <Box
          width={1}
          maxWidth={1200}
          px={4}
          py={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >

          <Title>
            My account
          </Title>

          <AccountInfo/>

          <Grid container spacing={8}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                <SubTitle>
                  Order history
                </SubTitle>
                <OrderHistory/>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                <SubTitle>
                  Referral
                </SubTitle>
                <ReferralInfo/>
              </Box>
            </Grid>
          </Grid>

        </Box>
      }
    </RequireConnection>
  );
}
