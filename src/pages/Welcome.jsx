import React from 'react';
import { useHistory } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import { Grid, Box } from '@material-ui/core';
import { Button } from '@aragon/ui'

import RateSample from '../components/RateSample';

const useStyles = makeStyles(() => ({
   logo: {
     width: 100,
     height: 100,
     color: 'blue',
     margin: 10,
  },
}));

function Welcome() {
  const classes = useStyles();
  const history = useHistory();

  const go = path => () => history.push(path);

  return (
    <Box width={1} py={3}>
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
        {/*<Box fontFamily="'Audiowide', cursive" fontSize="h6.fontSize">Crypto off ramp</Box>*/}
        <img src="logo512.png" alt="logo" className={classes.logo} />
      </Box>
      <Box display="flex" justifyContent="center" textAlign="center" fontSize="h6.fontSize">
        Easily transfer funds from your crypto wallet to your bank account.
      </Box>
      <RateSample />
        <Box py={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Button mode="strong" onClick={go('/send')} wide>Send funds</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button mode="strong" onClick={go('/send')} wide>My Account</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button mode="strong" onClick={go('/send')} wide>Contacts</Button>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
}

export default Welcome;
