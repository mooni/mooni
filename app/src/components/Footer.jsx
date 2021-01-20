import React from 'react';
import { useHistory } from 'react-router-dom';

import { Link, Box } from '@material-ui/core';
import { Link as ALink } from '@aragon/ui';
import {makeStyles} from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import { setInfoPanel } from '../redux/ui/actions';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
  },
  element: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  link: {
    color: 'black',
    cursor: 'pointer',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    }
  }
}));

function Footer() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const history = useHistory();

  return (
    <Box className={classes.root}>
      <Box className={classes.element}>
        <ALink href="https://github.com/pakokrew/mooni/tree/master" external className={classes.link}>v0.7</ALink>
      </Box>
      <Box className={classes.element}>
        <Link onClick={() => history.push('/stats')} className={classes.link}>
          Stats
        </Link>
      </Box>
      <Box className={classes.element}>
        <Link onClick={() => dispatch(setInfoPanel('terms'))} className={classes.link}>
          Terms
        </Link>
      </Box>
      <Box className={classes.element}>
        <Link onClick={() => dispatch(setInfoPanel('support'))} className={classes.link}>
          Support
        </Link>
      </Box>
      <Box className={classes.element}>
        <Link onClick={() => dispatch(setInfoPanel('about'))} className={classes.link}>
          About
        </Link>
      </Box>
    </Box>
  );
}

export default Footer;
