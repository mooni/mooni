import React from 'react';
import styled from 'styled-components';
import { get } from 'lodash';

import { Box, Flex } from '@chakra-ui/react';
import { textStyle } from '@aragon/ui';
import { WideInput } from '../UI/StyledComponents';

const ErrorMessage = styled.p`
  ${textStyle('body4')};
  text-align: right;
  color: #c10606;
  margin-top: 5px;
  margin-right: 5px;
`;

const FieldContainer = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 0;
`;
const Label = styled.span`
  ${textStyle('label2')};
  color: ${props => props.theme.surfaceContentSecondary};
  white-space: nowrap;
`;
const RequiredIcon = styled.span`
  color: ${props => props.theme.accent};
  margin-left: 0.1rem;
`;

function Field({ label, required, errorMessage, children }) {
  return (
    <FieldContainer>
      <Flex justify="space-between">
        <Box mb={2}>
          <Label>
            {label}
          </Label>
          <RequiredIcon>
            {required ? '*' : null}
          </RequiredIcon>
        </Box>
        <ErrorMessage>
          {errorMessage ?? null}
        </ErrorMessage>
      </Flex>
      <Box>
        {children}
      </Box>
    </FieldContainer>
  );
}

const FormField = React.forwardRef(({ label, name, required, children, errors, errorMessages, placeholder }, ref) =>{
  const errorMessage = get(errors, name) && errorMessages[name];
  return (
    <Field label={label} required={required} errorMessage={errorMessage}>
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
    </Field>
  )
});

export default FormField;
