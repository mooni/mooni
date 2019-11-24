import React from 'react';

import styled from 'styled-components';
import {textStyle, useTheme} from '@aragon/ui';

export const GroupLabel = styled.div`
  ${textStyle('label1')};
  margin-top: 10px;
  margin-bottom: 10px;
`;

export function FieldError({ text, children }) {
  const theme = useTheme();
  return (
    <p style={{
      color: theme.negative,
      fontSize: '10pt',
      marginTop: '5px',
      marginLeft: '13px',
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
