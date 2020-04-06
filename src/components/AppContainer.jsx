import React from 'react';

import {Box} from '@material-ui/core';
import Header from './Header';
import Footer from './Footer';
import ScrollRoot from './ScrollRoot';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    flexFlow: 'column',
  },
  container: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    flex: 1,
  },
  footer: {
    width: '100%',
    alignSelf: 'flex-end',
  }
}));

export default function AppContainer({ children }) {
  const classes = useStyles();
  return (
    <ScrollRoot>
      <Box className={classes.root}>
        <Header />
        <Box className={classes.container}>
          {children}
        </Box>
        <Box className={classes.footer}>
          <Footer />
        </Box>
      </Box>
    </ScrollRoot>
  );
}
