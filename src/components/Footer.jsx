import React from 'react';

import { Link, Info } from '@aragon/ui'
import { Grid, Box } from '@material-ui/core';

function Footer() {
  return (
    <Box>
      <Info mode="warning">
        This is experimental software provided as an alpha version and is in active development. Please use with care.
      </Info>
      <Box textAlign="center" pt={3} pb={1}>
        <Box fontSize="subtitle1" color="text.secondary" fontWeight="fontWeightLight" fontStyle="oblique">
          Made with
        </Box>
      </Box>
      <Grid container justify="center" alignItems="center" spacing={2}>
        <Grid item xs={12} sm={3}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Link href="https://bity.com" external>
              <img src="images/bity_logo_blue.svg" alt="bity.com" height={50} />
            </Link>
          </Box>
        </Grid>
        {/*<Grid item xs={12} sm={3}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Link href="https://dex.ag" external>
              <img src="images/dexag.svg" alt="dex.ag" height={50} />
            </Link>
          </Box>
        </Grid>*/}
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
            <a class="github-button" href="https://github.com/pakokrew/crypto-off-ramp" data-color-scheme="no-preference: dark; light: light; dark: dark;" aria-label="Find code on GitHub">Code</a>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Footer;
