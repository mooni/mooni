import React from 'react';
import styled from 'styled-components';
import { Flex, Button, useClipboard } from '@chakra-ui/react';
import { CheckCircleIcon, CopyIcon } from '@chakra-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { textStyle, LoadingRing, GU, Link } from '@aragon/ui';
import useSWR from 'swr';

import { selectUser } from '../../redux/user/userSlice';
import config from '../../config';
import { setInfoPanel } from '../../redux/ui/actions';
import { sendEvent } from '../../lib/analytics';
import MooniAPI from '../../lib/wrappers/mooni';
import { getJWS } from '../../redux/wallet/selectors';
import { ProfitShare } from '../../types/api';
import { significantNumbers } from '../../lib/numbers';

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
const KPIValue = styled.p`
  ${textStyle('body4')};
  text-align: center;
  font-size: 2rem;
  font-weight: 500;
  color: ${props => props.theme.selected}
`;

const KPILabel = styled.p`
  ${textStyle('label1')};
  text-align: center;
  font-weight: 300;
  color: ${props => props.theme.contentSecondary}
`;

export function ReferralBox() {
  const user = useSelector(selectUser);
  const referralURL = `${window.location.origin}?referralId=${user.referralId}`;
  const { hasCopied, onCopy } = useClipboard(referralURL);

  function copy() {
    sendEvent('copy_referral_link');
    onCopy();
  }

  return (
    <Flex direction="column" justify="center" align="center">
      <Content>
        Share referral link to earn cryptocurrency
      </Content>
      <Button
        onClick={copy}
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
  const jwsToken = useSelector(getJWS);
  const { data } = useSWR(jwsToken, MooniAPI.getProfitShare);

  const profitShare = data as ProfitShare;

  return (
    <>
      <Flex direction="column" align="center" mb={2}>
        <KPILabel>Orders referred</KPILabel>
        <KPIValue>
          {profitShare ?
            profitShare.referralTxCount
            :
            <LoadingRing mode="half-circle" />
          }
        </KPIValue>
      </Flex>
      <ReferralBox/>
      <SubContent>
        You can earn money by referring other people to use Mooni ! Any completed order referred by you will make you earn {config.referralSharing * 100}% profit sharing.
        <Link onClick={() => dispatch(setInfoPanel('support'))} style={{ textDecoration: 'none' }}>
          &nbsp;More info
        </Link>
      </SubContent>
      {profitShare && profitShare.referralTxCount > 0 &&
      <SubContent>
        You have accumulated {significantNumbers(profitShare.referralProfit)} ETH so far in profit sharing. Please contact support if you want to withdraw that.
      </SubContent>
      }
    </>
  );
}
