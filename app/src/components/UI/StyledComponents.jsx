import React from 'react';

import styled from 'styled-components';
import { Box, Button as BaseButton } from '@chakra-ui/react';
import { Link as ALink, Button as AButton } from '@aragon/ui';
import {Link as RouterLink, NavLink as RouterNavLink} from 'react-router-dom';

export const SmallWidth = styled.div`
  max-width: 25rem;
  width: 90%;
`;
export const MediumWidth = styled.div`
  max-width: 40rem;
  width: 90%;
`;

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
  :focus {
    outline: ${props => props.theme.selected} auto 1px;
  }  
`;

export const SimpleLink = styled(ALink)`
  text-decoration: none;
  &:hover: {
    textDecoration: none;
  }
`;

export const Link = styled(RouterLink)`
  text-decoration: none;
  :hover {
    text-decoration: none;
  }
`;
export const NavLink = styled(RouterNavLink)`
  text-decoration: none;
  :hover {
    text-decoration: none;
  }
`;

export function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  )
}
export const ShadowBox = styled.div`
  background: #FCFDFF;
  border: 1px solid #ececec;
  box-sizing: border-box;
  box-shadow: 2px 2px 4px rgba(86, 86, 86, 0.1);
  border-radius: 27px;
`;

export const RoundButton = styled(AButton)`
  border-radius: 25px;
`;

export const FlexCenterBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;


export function Button({leftIcon = null, children, ...props}) {
  return (
    <BaseButton
      leftIcon={leftIcon && <Box color='gray.400' >{leftIcon}</Box>}
      _disabled={{
        background: 'buttonDisabled',
        cursor: 'default',
      }}
      {...props}
    >
      {children}
    </BaseButton>
  );
}