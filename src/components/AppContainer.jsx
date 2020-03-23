import React from 'react';
import GitHubButton from 'react-github-btn';

import {
  useHistory,
} from 'react-router-dom';

import {Link, Info, Main, Header} from '@aragon/ui'
import {Grid, Box, Container} from '@material-ui/core';
import Login from './Login';
import Account from './Account';

export default function AppContainer({ children }) {
  const history = useHistory();

  return (
    <Main assetsUrl={`${process.env.PUBLIC_URL}/aragon-ui`}>
      <Header
        primary={
          <Box onClick={() => history.push('/')} style={{cursor: 'pointer'}} fontSize={26}>
            <span role="img" aria-label="mooni-logo">🌚</span>
          </Box>
        }
        secondary={<Account />}
      />
      <Container maxWidth="xs">
        {children}
      </Container>
    </Main>
  );
}
