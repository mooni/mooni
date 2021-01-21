import React from 'react';
import { Box } from '@material-ui/core';
import { EmptyStateCard, LoadingRing } from '@aragon/ui'
import LoadImage from '../../assets/undraw_counting_stars_rrnl.svg';

function Loader({ text = 'Loading...' }) {
  return (
    <Box py={2} display="flex" justifyContent="center">
      <EmptyStateCard
        text={text}
        illustration={<img src={LoadImage} width="80%" alt="" />}
        action={<Box display="flex" justifyContent="center"><LoadingRing /></Box>}
      />
    </Box>
  );
}

export default Loader;
