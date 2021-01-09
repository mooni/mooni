import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { textStyle, GU, TextCopy } from '@aragon/ui';

import { selectUser } from '../../redux/user/userSlice';

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

  return (
    <>
      <Content>
        Earn cryptocurrency by sharing this referral link:
      </Content>
      <TextCopy
        value={`https://app.mooni.tech?referralId=${user.referralId}`}
      />
      <SubContent>
        You can earn money by referring other people to use Mooni ! Any completed order referred by you will make you earn 10 % profit sharing.
      </SubContent>
    </>
  );
}
