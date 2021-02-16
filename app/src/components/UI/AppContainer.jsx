import React from 'react';

import {Box} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import Header from '../Header';
import ScrollRoot from '../Utils/ScrollRoot';
import { TypeformFeedback } from '../Utils/Feedback';
import styled from "styled-components";


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
    marginTop: 20,
    marginBottom: 20,
  },
  footer: {
    width: '100%',
    alignSelf: 'flex-end',
  }
}));

const BottomSM = styled.div`
  height: 0;
  @media (max-width: 960px) {
    height: 72px;
  }
`;

export default function AppContainer({ children }) {
  const classes = useStyles();
  return (
    <ScrollRoot>
      <Box className={classes.root}>
        <Header />
        <Box className={classes.container}>
          {children}
        </Box>
        <BottomSM/>
        <TypeformFeedback/>
      </Box>
    </ScrollRoot>
  );
}
