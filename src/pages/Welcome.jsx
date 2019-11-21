import React from 'react';
import { useSelector } from 'react-redux';

import {
  Link
} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import { Grid, Box } from '@material-ui/core';
import { Button } from '@aragon/ui'

import { isLogged } from '../redux/eth/selectors';
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

  const logged = useSelector(isLogged);

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
      {
        logged &&
        <Box py={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Link to="/send"><Button mode="strong" wide>Send funds</Button></Link>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Link to="/my-account"><Button mode="strong" wide>My Account</Button></Link>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Link to="/contacts"><Button mode="strong" wide>Contacts</Button></Link>
            </Grid>
          </Grid>
        </Box>
      }
    </Box>
  );
}

export default Welcome;
