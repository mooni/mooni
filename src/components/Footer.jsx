import React from 'react';
import GitHubButton from 'react-github-btn';

import { Link, Info } from '@aragon/ui'
import { Grid, Box } from '@material-ui/core';

function Footer() {
  return (
    <Box pt={2}>
      <Box pb={2}>
        <Info mode="warning">
          This is experimental software provided as an alpha version and is in active development. Please use with care.
        </Info>
      </Box>
      <Grid container justify="center" alignItems="center" spacing={4}>
        <Grid item>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Link href="https://mooni.launchaco.com" external style={{ textDecoration: 'none' }}>
              About
            </Link>
          </Box>
        </Grid>
        <Grid item>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Link href="mailto:usemooni@gmail.com" external style={{ textDecoration: 'none' }}>
              Contact
            </Link>
          </Box>
        </Grid>
        <Grid item>
          <Box display="flex" justifyContent="center">
            <GitHubButton href="https://github.com/pakokrew/mooni" data-color-scheme="no-preference: dark; light: dark; dark: dark;">Source code</GitHubButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Footer;
