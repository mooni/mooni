import React from 'react';

import {Link as RouterLink} from 'react-router-dom';
import { Link, Box } from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

import AccountBadge from './Account/AccountBadge';

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
    height: '30px',
  },
  appName: {
    fontFamily: `'Montserrat', sans-serif`,
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
    color: '#18b37b',
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
        <img src="logo192.png" alt="mooni-logo" className={classes.logo} />
        <h1 className={classes.appName}>
          MOONI
        </h1>
        <span className={classes.alpha}>
          beta
        </span>
      </Link>
      <Box className={classes.element}>
        <AccountBadge />
      </Box>
    </Box>
  );
}

