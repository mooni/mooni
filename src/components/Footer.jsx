import React from 'react';
import GitHubButton from 'react-github-btn';

import { Link, Info } from '@aragon/ui'
import { Grid, Box } from '@material-ui/core';

function Footer() {
  return (
    <Box pt={4}>
      <Info mode="warning">
        This is experimental software provided as an alpha version and is in active development. Please use with care.
      </Info>
      <Box textAlign="center" pt={3} pb={1}>
        <Box fontSize={14} color="text.secondary" fontWeight="fontWeightLight" fontStyle="oblique">
          Powered by
        </Box>
      </Box>
      <Grid container justify="center" alignItems="center" spacing={2}>
        <Grid item xs={12} sm>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Link href="https://bity.com" external>
              <img src="images/bity_logo_blue.svg" alt="bity.com" height={30} />
            </Link>
          </Box>
        </Grid>
        <Grid item xs={12} sm>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Link href="https://dex.ag" external>
              <img src="images/dexag.svg" alt="dex.ag" height={30} />
            </Link>
          </Box>
        </Grid>
        <Grid item xs={12} sm>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Link href="https://3box.io" external>
              <img src="images/3box.svg" alt="3box.io" height={30} />
            </Link>
          </Box>
        </Grid>
      </Grid>
      <Box py={2}>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item>
            <GitHubButton href="https://github.com/pakokrew/crypto-off-ramp" data-color-scheme="no-preference: dark; light: dark; dark: dark;">Source code</GitHubButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Footer;
