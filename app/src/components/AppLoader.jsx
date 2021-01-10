import React, { useContext } from 'react';
import styled from 'styled-components';

import {CurrenciesContext} from "../contexts/CurrenciesContext";

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justifyContent: center;
`;

export default function AppLoader({ children }) {
  const { currenciesReady } = useContext(CurrenciesContext);

  if(currenciesReady) return children;

  return (
    <Container>
      Loading app
    </Container>
  );
}
