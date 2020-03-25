import React from 'react';

import {
  useHistory,
} from 'react-router-dom';

import {Main, Header} from '@aragon/ui'
import {Box, Container} from '@material-ui/core';
import Account from './Account';

const appNameStyle = {
  fontFamily:'Montserrat, sans-serif',
  textTransform: 'uppercase',
  fontSize: 24,
  lineHeight: 1,
  fontWeight: 400,
  letterSpacing: 1,
};
export default function AppContainer({ children }) {
  const history = useHistory();

  return (
    <Main assetsUrl={`${process.env.PUBLIC_URL}/aragon-ui`} theme="light">
      <Header
        primary={
          <Box onClick={() => history.push('/')} style={{cursor: 'pointer'}} fontSize={26}>
            <span style={appNameStyle} className="noselect"><span role="img" aria-label="mooni-logo">🌚</span> Mooni</span>
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
