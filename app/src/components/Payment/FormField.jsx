import React from 'react';
import styled from 'styled-components';

import { Field, textStyle } from '@aragon/ui';
import { WideInput } from '../UI/StyledComponents';

const fieldStyle = {
  marginTop: '0.5rem',
  marginBottom: '0px',
};

const ErrorMessage = styled.p`
  ${textStyle('body4')};
  text-align: right;
  color: #c10606;
  margin-top: 5px;
  margin-right: 5px;
`;

const FormField = React.forwardRef(({ label, name, required, children, errors, errorMessages, placeholder }, ref) =>{
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
      {errors[name] && <ErrorMessage>{errorMessages[name]}</ErrorMessage>}
    </Field>
  )
});

export default FormField;
