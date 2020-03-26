import React from 'react';

import {Link as RouterLink} from 'react-router-dom';
import { Link, Box } from '@material-ui/core';
import Account from './Account';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1)
  },
  element: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    margin: theme.spacing(2, 1),
  },
  appLink: {
    '&:hover': {
      textDecoration: 'none',
    }
  },
  logo: {
    marginRight: theme.spacing(1),
  },
  appName: {
    fontFamily:'Montserrat, sans-serif',
    textTransform: 'uppercase',
    fontSize: 24,
    lineHeight: 1,
    fontWeight: 400,
    letterSpacing: 1,
    color: 'black',
    textDecoration: 'none',
  },
  alpha: {
    textTransform: 'uppercase',
    position: 'relative',
    fontSize: 9,
    top: -13,
    right: -3,
  }
}));


export default function Header() {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Link to="/" component={RouterLink} className={`${classes.element} ${classes.appLink} noselect`}>
        <span role="img" aria-label="mooni-logo" className={classes.logo}>🌚</span>
        <span className={classes.appName}>
            MOONI
          </span>
        <span className={classes.alpha}>
            alpha
          </span>
      </Link>
      <Box className={classes.element}>
        <Account />
      </Box>
    </Box>
  );
}

