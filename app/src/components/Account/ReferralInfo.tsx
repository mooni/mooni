import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { textStyle, GU, TextCopy, Link } from '@aragon/ui';

import { selectUser } from '../../redux/user/userSlice';
import config from '../../config';
import { setInfoPanel } from '../../redux/ui/actions';

const Content = styled.p`
  ${textStyle('body2')};
  text-align: center;
  margin-top: ${2 * GU}px;
  margin-bottom: ${2 * GU}px;
`;
const SubContent = styled.p`
  ${textStyle('body4')};
  text-align: center;
  margin-top: ${2 * GU}px;
`;

export default function ReferralInfo() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  return (
    <>
      <Content>
        Earn cryptocurrency by sharing this referral link:
      </Content>
      <TextCopy
        value={`${window.location.origin}?referralId=${user.referralId}`}
      />
      <SubContent>
        You can earn money by referring other people to use Mooni ! Any completed order referred by you will make you earn {config.referralSharing * 100}% profit sharing.
        <Link onClick={() => dispatch(setInfoPanel('support'))} style={{ textDecoration: 'none' }}>
          &nbsp;More info
        </Link>
      </SubContent>
    </>
  );
}
