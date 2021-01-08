import React from 'react';
import styled from 'styled-components';

import { Box, Typography } from '@material-ui/core';
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

export default function ProfilePage() {
  const user = useSelector(selectUser);

  return (
    <RequireConnection>
      {() =>
        <Box
          width={1}
          maxWidth={500}
          py={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >

          <Title>
            My account
          </Title>

          <SubTitle>
            Order history
          </SubTitle>
          <OrderHistory/>
          <SubTitle>
            Referral
          </SubTitle>
          <Typography variant="body2">
            You can earn money by referring other people to use Mooni ! Any completed order referred by you will make you earn 10 % profit sharing.
          </Typography>
          <Typography variant="body1">
            Earn cryptocurrency by sharing this referral link:
          </Typography>
          <TextCopy
            value={`https://app.mooni.tech?referralId=${user.referralId}`}
          />

        </Box>
      }
    </RequireConnection>
  );
}
