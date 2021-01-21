import React from 'react';
import styled from 'styled-components';

import { Box } from '@material-ui/core';

import { GU, IconArrowRight, textStyle } from '@aragon/ui'
import {RoundButton} from "../UI/StyledComponents";

const Hint = styled.p`
  ${textStyle('body3')};
  margin-bottom: ${1 * GU}px;
  text-align: center;
  color: #5d6d7b;
`;

const Title = styled.p`
  ${textStyle('title3')};
  font-size: 16px;
  text-align: center;
`;

const Info = styled.p`
  ${textStyle('body3')};
  margin-bottom: 5px;
`;

export default function StepNotice({ onComplete }) {
  return (
    <Box width={1}>
      <Hint>
        Please read carefully the following informations
      </Hint>
      <Title>Experimental software</Title>
      <Info>
        You are using an early stage software.
        If you encounter any bugs, you can reach out our support to find a solution.
      </Info>
      <Title>Transfer recipient</Title>
      <Info>
        You are supposed to send funds to a bank account you own. Do not send funds to a third party or a corporate account.
      </Info>
      <Title>Unsupported banks</Title>
      <Info>
        The following banks are <b>known to reject</b> payments from our services:
        &nbsp;<i style={{color: '#881111'}}>Payoneer, Transferwise</i>
      </Info>
      <Box mt={2}/>
      <RoundButton mode="strong" onClick={onComplete} wide icon={<IconArrowRight/>} label="I understand, let's go!" />
    </Box>
  )
}
