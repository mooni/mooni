import React from 'react';
import styled from 'styled-components';

import { Box, Grid, makeStyles } from '@material-ui/core';
import { textStyle, GU } from '@aragon/ui';

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

const useStyles = makeStyles(theme => ({
  gridContainer: {
    marginTop: 16,
  },
  gridItem: {
    padding: '12px 24px',
  },
}));

export default function AccountPage() {
  const classes = useStyles();

  return (
    <Box
      width={1}
      maxWidth={1200}
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

      <Grid container classes={{'root': classes.gridContainer}}>

        <Grid item xs={12} sm={6} classes={{'item': classes.gridItem}}>
          <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
            <SubTitle>
              Referral
            </SubTitle>
            <ReferralInfo/>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} classes={{'item': classes.gridItem}}>
          <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
            <SubTitle>
              Order history
            </SubTitle>
            <OrderHistory/>
          </Box>
        </Grid>
      </Grid>

    </Box>
  );
}
