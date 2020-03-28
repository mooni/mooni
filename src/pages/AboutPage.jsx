import React from 'react';
import GitHubButton from 'react-github-btn';

import { Link } from '@aragon/ui'
import { Box } from '@material-ui/core';

export default function AboutPage() {
  return (
    <Box pt={2}>
      <Box>
        Mooni is a web application allowing to transfer funds from a crypto wallet to a bank account.
      </Box>
      <Box mt={2}>
        It is possible to integrate Mooni into any applications. Please refer to
        <Link href="https://github.com/pakokrew/mooni#-Frontend-integration" external style={{ textDecoration: 'none' }}>
          &nbsp;the documentation
        </Link>
        .
      </Box>
      <Box mt={1}>
        <GitHubButton href="https://github.com/pakokrew/mooni" data-color-scheme="no-preference: dark; light: dark; dark: dark;">Source code</GitHubButton>
      </Box>
      <Box mt={1}>
        <Link href="mailto:usemooni@gmail.com" external style={{ textDecoration: 'none' }}>
          Contact
        </Link>
      </Box>
    </Box>
  );
}
