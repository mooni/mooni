import React from 'react';

import Root from './Root';
import {makeStyles} from '@material-ui/core/styles/index';

const useStyles = makeStyles(() => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'grey',
    width: '100%',
    height: '100%',
  },
}));

export default function Demo() {
  const classes = useStyles();

  return  (
    <div className={classes.root}>
      My awesome marketplace
      <Root widget={true} />
    </div>
  );
}
