import React from 'react';
import styled from 'styled-components';
import { Flex, Button, useClipboard } from '@chakra-ui/react';
import { CheckCircleIcon, CopyIcon } from '@chakra-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { textStyle, GU, Link } from '@aragon/ui';

import { selectUser } from '../../redux/user/userSlice';
import config from '../../config';
import { setInfoPanel } from '../../redux/ui/actions';

const Content = styled.p`
  ${textStyle('body2')};
  text-align: center;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
`;
const SubContent = styled.p`
  ${textStyle('body4')};
  text-align: center;
  margin-top: ${2 * GU}px;
  max-width: 335px;
`;

export function ReferralBox() {
  const user = useSelector(selectUser);
  const referralURL = `${window.location.origin}?referralId=${user.referralId}`;
  const { hasCopied, onCopy } = useClipboard(referralURL);

  return (
    <Flex direction="column" justify="center" align="center">
      <Content>
        Share referral link to earn cryptocurrency
      </Content>
      <Button
        onClick={onCopy}
        leftIcon={hasCopied ? <CheckCircleIcon/> : <CopyIcon/>}
        size="sm"
        variant="link"
      >
          {hasCopied ? "Copied": "Copy referral link"}
      </Button>
    </Flex>
  );
}

export default function ReferralInfo() {
  const dispatch = useDispatch();

  return (
    <>
      <ReferralBox/>
      <SubContent>
        You can earn money by referring other people to use Mooni ! Any completed order referred by you will make you earn {config.referralSharing * 100}% profit sharing.
        <Link onClick={() => dispatch(setInfoPanel('support'))} style={{ textDecoration: 'none' }}>
          &nbsp;More info
        </Link>
      </SubContent>
    </>
  );
}
