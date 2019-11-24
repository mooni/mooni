import React from 'react';
import { Box } from '@material-ui/core';
import { EmptyStateCard, LoadingRing } from '@aragon/ui'

function Loader({ text = 'Loading...' }) {
  return (
    <Box py={2} display="flex" justifyContent="center">
      <EmptyStateCard
        text={text}
        action={<Box display="flex" justifyContent="center"><LoadingRing /></Box>}
      />
    </Box>
  );
}

export default Loader;
