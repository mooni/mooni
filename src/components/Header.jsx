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
    justifyContent: 'space-between'
  },
  element: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    margin: theme.spacing(3),
  },
  appLink: {
    fontFamily:'Montserrat, sans-serif',
    textTransform: 'uppercase',
    fontSize: 24,
    lineHeight: 1,
    fontWeight: 400,
    letterSpacing: 1,
    color: 'black',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    }
  },
  logo: {
    marginRight: theme.spacing(1),
  }
}));


export default function Header() {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.element}>
        <Link to="/" component={RouterLink} className={`${classes.appLink} noselect`}>
          <span role="img" aria-label="mooni-logo" className={classes.logo}>🌚</span>
          <span>
            MOONI
          </span>
        </Link>
      </Box>
      <Box className={classes.element}>
        <Account />
      </Box>
    </Box>
  );
}

