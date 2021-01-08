import React from 'react';

import { Box, Typography } from '@material-ui/core';
import { TextCopy } from '@aragon/ui';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/user/userSlice';

import RequireConnection from "../components/RequireConnection";

export default function ProfilePage() {
  const user = useSelector(selectUser);

  return (
    <RequireConnection>
      {() =>
        <Box width={1} py={2}>
          <Box textAlign="center">
            <Typography variant="h2">
              My account
            </Typography>
            <Typography variant="subtitle2">
              Address
            </Typography>
            <Typography variant="body2">
              {user.ethAddress}
            </Typography>
            <Typography variant="subtitle2">
              Referral
            </Typography>
            <Typography variant="body1">
              Share this URL to someone, and get 10% profit sharing !
            </Typography>
            <TextCopy
              value={`https://app.mooni.tech?referralId=${user.referralId}`}
            />
          </Box>
        </Box>
      }
    </RequireConnection>
  );
}
