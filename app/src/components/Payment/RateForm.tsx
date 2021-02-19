import React, { useCallback } from 'react';

import {Box, Flex} from '@chakra-ui/react';
import {useSelector, useDispatch} from 'react-redux';

import {IconCaution, IconCoin, IconRefresh, LoadingRing, IconEthereum, textStyle} from '@aragon/ui'
import styled from 'styled-components';

import { AmountRow } from './AmountRow';

import {TradeExact, TradeRequest} from '../../lib/trading/types';
import {BN} from '../../lib/numbers';

import { useRate } from '../../hooks/rates';
import { getWalletStatus } from '../../redux/wallet/selectors';
import { CurrencyType } from '../../lib/trading/currencyTypes';
import { RateAmount } from './RateAmount';
import { WalletStatus } from '../../redux/wallet/state';
import { ApprovalState, useApprovalForMultiTradeEstimation } from '../../hooks/allowance';
import { logError } from '../../lib/log';
import { RoundButton } from '../UI/StyledComponents';
import { login } from '../../redux/wallet/actions';
import { dailyLimits } from '../../constants/limits';
import { numberWithCommas } from '../../lib/numbers';
import { useBalance } from '../../hooks/balance';

const InvalidMessage = styled.p`
  ${textStyle('body4')};
  color: ${props => props.theme.negative};
`;

interface RateFormParams {
  onSubmit: (TradeRequest?) => void;
  initialTradeRequest: TradeRequest;
  buttonLabel?: string,
  buttonIcon?: any,
}

function RateForm({ onSubmit = () => null, initialTradeRequest }: RateFormParams) {
  const dispatch = useDispatch();
  const walletStatus = useSelector(getWalletStatus);

  const { rateForm, tradeRequest, multiTradeEstimation, onChangeAmount, onChangeCurrency } = useRate(initialTradeRequest);
  const { approvalState, approveAllowance } = useApprovalForMultiTradeEstimation(multiTradeEstimation);
  const { balanceLoading, balance } = useBalance(rateForm.values.inputCurrency);

  const errors = rateForm.errors;

  const insufficientBalance = !balanceLoading ?
    new BN(balance).lt(rateForm.values.inputAmount)
    :
    false;

  const submit = useCallback(() => {
    if(!tradeRequest) return;
    onSubmit(tradeRequest);
  }, [tradeRequest, onSubmit]);

  const approve = useCallback(() => {
    approveAllowance()
      .catch(error => {
        if(error.message === 'user-rejected-transaction') return;
        else {
          logError('approve-error', error);
        }
      })
  }, [approveAllowance]);

  let button;
  if(walletStatus === WalletStatus.CONNECTED) {
    if(approvalState === ApprovalState.MINING) {
      button = <RoundButton wide icon={<LoadingRing/>} label="Unlocking tokens" disabled />;
    } else if (rateForm.loading) {
      button = <RoundButton wide icon={<LoadingRing/>} label="Loading rates" disabled />;
    } else if(balanceLoading) {
      button = <RoundButton wide icon={<LoadingRing/>} label="Loading balances" disabled />;
    } else if(insufficientBalance) {
      button = <RoundButton wide icon={<IconCaution/>} label="Insufficient balance" disabled />;
    } else if(errors) {
      button = <RoundButton wide icon={<IconCaution/>} label="Invalid" disabled />;
    } else if(approvalState === ApprovalState.LOADING) {
      button = <RoundButton wide icon={<LoadingRing/>} label="Checking allowance" disabled />;
    } else if(approvalState === ApprovalState.UNKNOWN) {
      button = <RoundButton wide icon={<IconRefresh/>} label="Exchange" disabled />;
    } else if(approvalState === ApprovalState.NOT_APPROVED) {
      button = <RoundButton mode="positive" onClick={approve} wide icon={<IconCoin/>} label="Unlock token" />
    } else {
      button = <RoundButton mode="strong" onClick={submit} wide icon={<IconRefresh/>} label="Exchange"  />
    }
  } else if(walletStatus === WalletStatus.DISCONNECTED) {
    if (rateForm.loading) {
      button = <RoundButton wide icon={<LoadingRing/>} label="Loading rates" disabled />;
    } else {
      button = <RoundButton mode="positive" onClick={() => dispatch(login())} wide icon={<IconEthereum/>} label="Connect wallet" />
    }
  } else {
    button = <RoundButton disabled wide icon={<LoadingRing/>} display="all" label="Connecting..." />
  }

  return (
    <>
      <AmountRow
        value={rateForm.values.inputAmount}
        currencyType={CurrencyType.CRYPTO}
        selectedSymbol={rateForm.values.inputCurrency}
        onChangeCurrency={onChangeCurrency(TradeExact.INPUT)}
        onChangeValue={onChangeAmount(TradeExact.INPUT)}
        active={rateForm.values.tradeExact === TradeExact.INPUT}
        // currencyDisabled={rateForm.values.tradeExact === TradeExact.OUTPUT && rateForm.loading}
        // valueDisabled={rateForm.values.tradeExact === TradeExact.OUTPUT && rateForm.loading}
        error={!rateForm.loading && rateForm.values.tradeExact === TradeExact.INPUT && !!errors}
        caption="Send"
      />
      <AmountRow
        value={rateForm.values.outputAmount}
        currencyType={CurrencyType.FIAT}
        selectedSymbol={rateForm.values.outputCurrency}
        onChangeCurrency={onChangeCurrency(TradeExact.OUTPUT)}
        onChangeValue={onChangeAmount(TradeExact.OUTPUT)}
        active={rateForm.values.tradeExact === TradeExact.OUTPUT}
        // currencyDisabled={rateForm.values.tradeExact === TradeExact.INPUT && rateForm.loading}
        // valueDisabled={rateForm.values.tradeExact === TradeExact.INPUT && rateForm.loading}
        error={!rateForm.loading && rateForm.values.tradeExact === TradeExact.OUTPUT && !!errors}
        caption="Receive"
      />

      <Box mt={4}>
        {button}
      </Box>

      {errors &&
      <Flex justify="center" mt={4}>
        {Object.entries(errors).map(([key, _]) =>
          <InvalidMessage key={key}>
            {key === 'lowAmount' && `Minimum amount is ${errors[key]} ${rateForm.values.outputCurrency}`}
            {key === 'highAmount' && `Maximum amount is ${numberWithCommas(dailyLimits[rateForm.values.outputCurrency])} ${rateForm.values.outputCurrency}`}
            {key === 'lowLiquidity' && `There is not enough liquidity for this pair to trade. Please try with another currency.`}
            {key === 'zeroAmount' && `Amount can't be zero`}
            {key === 'failed' && `Impossible to fetch rates. Please try with different amounts.`}
          </InvalidMessage>
        )}
      </Flex>
      }

      {multiTradeEstimation &&
      <Box mt={4}>
        <RateAmount multiTradeEstimation={multiTradeEstimation}/>
      </Box>
      }
    </>
  );
}

export default RateForm;
