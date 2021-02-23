import React from 'react';
import { Box } from '@chakra-ui/react';
import { LoadingRing } from '@aragon/ui'
import LoadImage from '../../assets/undraw_counting_stars_rrnl.svg';
import { Surface } from './StyledComponents';

function Loader({ text = 'Loading...' }) {
  return (
    <Surface
      pt={8}
      py={6}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="300px"
      boxShadow="medium"
      maxWidth="300px"
      w="90%"
    >
      <img src={LoadImage} width="80%" alt="" />
      <Box textAlign="center" my={4}>{text}</Box>
      <LoadingRing mode="half-circle" />
    </Surface>
  );
}

export default Loader;
