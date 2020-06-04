import React from 'react';

import styled from 'styled-components';
import { Link, useTheme } from '@aragon/ui';

export const SmallWidth = styled.div`
  max-width: 25rem;
  width: 90%;
`;
export const MediumWidth = styled.div`
  max-width: 40rem;
  width: 90%;
`;

export function FieldError({ text, children }) {
  const theme = useTheme();
  return (
    <p style={{
      color: theme.negative,
      fontSize: '10pt',
    }}>
      {text || children}
    </p>
  )
}

// TODO replace with Aragon's TextInput when form ref fixed
export const WideInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  background: #FFFFFF;
  border: 1px solid #DDE4E9;
  color: #212B36;
  border-radius: 4px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
`;

export const SimpleLink = styled(Link)`
  text-decoration: none;
  &:hover: {
    textDecoration: none;
  }
`;
