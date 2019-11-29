import React from 'react';

import { Info } from '@aragon/ui'
import { Box } from '@material-ui/core';

function Terms() {
  return (
    <Box pt={4}>
      <Info mode="warning">
        This is experimental software provided as an alpha version and is in active development. Please use with care.
      </Info>
      <Box>
        This application is still under development and we deny all responsibility if a bug happens while using it.
      </Box>
      <Box>
        The exchange between crypto to fiat is executed by bity.com, a third party provider, which we are not affiliated with.
      </Box>
      <Box>
        This terms are a draft.
      </Box>
      <Box>
        Take care.
      </Box>
    </Box>
  );
}

export default Terms;
