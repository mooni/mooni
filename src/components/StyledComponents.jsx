import styled from 'styled-components';
import {textStyle} from '@aragon/ui/dist/index.cjs';

export const GroupLabel = styled.div`
  ${textStyle('label1')};
  margin-top: 10px;
  margin-bottom: 10px;
`;

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
