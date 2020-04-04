import React from 'react';

import {Box} from '@material-ui/core';
import Header from './Header';
import Footer from './Footer';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    height: '100vh',
    flexFlow: 'column',
  },
  container: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    flex: '1 1 0%',
  },
  footer: {
    width: '100%',
    minHeight: '30px',
    alignSelf: 'flex-end',
  }
}));

export default function AppContainer({ children }) {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Header />
      <Box className={classes.container}>
        {children}
      </Box>
      <Box className={classes.footer}>
        <Footer />
      </Box>
    </Box>
  );
}
