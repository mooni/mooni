import React from 'react';

import Header from '../Header';
import ScrollRoot from '../Utils/ScrollRoot';
import { TypeformFeedback } from '../Utils/Feedback';
import styled from "styled-components";

const Root = styled.div`
  display: flex;
  align-items: flex-start;
  flex-flow: column;
  min-height: 100%;
  background-position: 0px -30vh;
  background-repeat: no-repeat;
  background-image: radial-gradient(50% 50% at 50% 50%,rgb(181 184 222 / 12%) 0%,rgba(255,255,255,0) 100%);
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  flex: 1;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const BottomSM = styled.div`
  height: 0;
  @media (max-width: 960px) {
    height: 72px;
  }
`;

export default function AppContainer({ children }) {
  return (
    <ScrollRoot>
      <Root>
        <Header />
        <Container>
          {children}
        </Container>
        <BottomSM/>
        <TypeformFeedback/>
      </Root>
    </ScrollRoot>
  );
}
