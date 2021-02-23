import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';

import { Box } from '@material-ui/core';

import { GU, IconArrowRight, Checkbox, textStyle } from '@aragon/ui'
import {RoundButton} from "../UI/StyledComponents";
import {setInfoPanel} from "../../redux/ui/actions";

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
const Link = styled.a`
  color: ${props => props.theme.selected};
  cursor: pointer;
`;

export default function StepNotice({ onComplete }) {
  const dispatch = useDispatch();
  const [termsAccepted, setTermsAccepted] = useState(false);

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
        You are supposed to send funds to a bank account you own. Do not send funds to a third party or a corporate account. All the exchanges done within this app are legally regulated under swiss laws, but you are responsible for your own tax fillings.
      </Info>
      <Title>Unsupported banks</Title>
      <Info>
        The following banks are <b>known to reject</b> payments from our services:
        &nbsp;<i style={{color: '#881111'}}>Payoneer, Transferwise</i>
      </Info>
      <Box my={2} display="flex" justifyContent="center">
        <Checkbox
          checked={termsAccepted}
          onChange={setTermsAccepted}
        />
        <Box>
          I agree with the <Link onClick={() => dispatch(setInfoPanel('terms'))}>terms of service</Link>
        </Box>
      </Box>
      <RoundButton mode="strong" onClick={onComplete} wide icon={<IconArrowRight/>} disabled={!termsAccepted} label="Let's go!" />
    </Box>
  )
}
