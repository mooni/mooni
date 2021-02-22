import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from "styled-components";

import { Box } from '@chakra-ui/react';

import { setExchangeStep, setTradeRequest } from '../redux/payment/actions';
import { SmallWidth } from '../components/UI/StyledComponents';
import RateForm from '../components/Payment/RateForm';
import { getMultiTradeRequest } from '../redux/payment/selectors';
import {getWalletStatus} from "../redux/wallet/selectors";
import {WalletStatus} from "../redux/wallet/state";
import {ReferralBox} from "../components/Account/ReferralInfo";
import {Surface} from "../components/UI/StyledComponents";

export const HeadLine = styled.h2`
  margin-bottom: 2rem;
  text-align: center;
`;

export default function HomePage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { tradeRequest } = useSelector(getMultiTradeRequest);
  const walletStatus = useSelector(getWalletStatus);

  const onSubmit = (tradeRequest) => {
    dispatch(setTradeRequest(tradeRequest));
    dispatch(setExchangeStep(1));
    history.push('/exchange');
  };

  return (
    <SmallWidth>
      <Box w="100%">
        <HeadLine>
            Transfer funds from your crypto wallet to your bank account.
        </HeadLine>
        <Surface px={4} py={8} boxShadow="medium">
          <RateForm onSubmit={onSubmit} initialTradeRequest={tradeRequest}/>
        </Surface>
        {walletStatus === WalletStatus.CONNECTED &&
        <Box mt={2}>
          <ReferralBox/>
        </Box>
        }
      </Box>
    </SmallWidth>
  );
}
