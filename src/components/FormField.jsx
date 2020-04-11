import React from 'react';
import styled from 'styled-components';

import { Field, textStyle } from '@aragon/ui';

const fieldStyle = {
  marginBottom: '0px',
  height: '88px',
};

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

const ErrorMessage = styled.p`
  ${textStyle('body4')};
  text-align: right;
  color: #c10606;
  margin-top: 5px;
  margin-right: 5px;
`;

const FormField = React.forwardRef(({ label, name, required, children, errors, errorMessage, placeholder }, ref) =>{
  return (
    <Field label={label} style={fieldStyle} required={required}>
      {children ?
        children
        :
        <WideInput
          name={name}
          ref={ref}
          placeholder={placeholder}
          data-private
        />
      }
      {errors[name] && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </Field>
  )
});

export default FormField;
