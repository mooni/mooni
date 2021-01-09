import React from 'react';
import styled from 'styled-components';

import { Box, Grid, makeStyles } from '@material-ui/core';
import { TextCopy, textStyle, GU } from '@aragon/ui';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/user/userSlice';

import RequireConnection from "../components/RequireConnection";
import OrderHistory from '../components/OrderHistory';


const Title = styled.p`
  ${textStyle('title2')};
  margin-bottom: ${2 * GU}px;
`;

const SubTitle = styled.p`
  ${textStyle('title4')};
  margin-top: ${2 * GU}px;
  margin-bottom: ${2 * GU}px;
`;

const Content = styled.p`
  ${textStyle('body2')};
  text-align: center;
  margin-top: ${2 * GU}px;
  margin-bottom: ${2 * GU}px;
`;
const SubContent = styled.p`
  ${textStyle('body4')};
  text-align: center;
  margin-top: ${2 * GU}px;
`;


const useStyles = makeStyles({
  grid: {
    padding: 2,
  },
});

export default function ProfilePage() {
  const user = useSelector(selectUser);
  const classes = useStyles();
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

          <Grid container spacing={8} classes={{'spacing-xs-8': classes.grid}}>
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
                <Content>
                  Earn cryptocurrency by sharing this referral link:
                </Content>
                <TextCopy
                  value={`https://app.mooni.tech?referralId=${user.referralId}`}
                />
                <SubContent>
                  You can earn money by referring other people to use Mooni ! Any completed order referred by you will make you earn 10 % profit sharing.
                </SubContent>
              </Box>
            </Grid>
          </Grid>

        </Box>
      }
    </RequireConnection>
  );
}
