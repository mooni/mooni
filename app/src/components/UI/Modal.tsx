import React from 'react';

import styled from 'styled-components';

const Root = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-color: #b1aeae5c;
  backdrop-filter: blur(2px);
  z-index: 1400;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScrollContainer = styled.div`
  height: 100%;
  padding: 70px 20px 40px;
  width: 28rem;
  overflow: scroll;
`;

export function ForceModal({ children }) {
  return (
    <Root>
      <ScrollContainer>
        {children}
      </ScrollContainer>
    </Root>
  )
}