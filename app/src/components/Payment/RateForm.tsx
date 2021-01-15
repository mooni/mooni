import React, { useCallback } from 'react';

import {Box} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {useSelector, useDispatch} from 'react-redux';

import {IconCoin, IconRefresh, LoadingRing, IconEthereum, textStyle} from '@aragon/ui'
import styled from 'styled-components';

import config from '../../config';
import { AmountRow } from './AmountRow';

import {TradeExact, TradeRequest} from '../../lib/trading/types';

import {useRate} from '../../hooks/rates';
import {getWalletStatus} from '../../redux/wallet/selectors';
import {CurrencyType} from "../../lib/trading/currencyTypes";
import { RateAmount, RateAmountSuspense } from './RateAmount';
import { WalletStatus } from "../../redux/wallet/state";
import { useAllowance } from '../../hooks/allowance';
import { logError } from '../../lib/log';
import { RoundButton } from '../UI/StyledComponents';
import { login } from '../../redux/wallet/actions';

const InvalidMessage = styled.p`
  ${textStyle('body4')};
  color: #e61b1b;
`;

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
  },
  additionalInfo: {
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    color: theme.palette.text.secondary,
  },
}));

interface RateFormParams {
  onSubmit: (TradeRequest?) => void;
  initialTradeRequest: TradeRequest;
  buttonLabel?: string,
  buttonIcon?: any,
}

function RateForm({ onSubmit = () => null, initialTradeRequest }: RateFormParams) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const walletStatus = useSelector(getWalletStatus);

  const { rateForm, tradeRequest, multiTradeEstimation, onChangeAmount, onChangeCurrency } = useRate(initialTradeRequest);
  const { allowanceReady, allowanceMining, allowanceLoading, approveAllowance } = useAllowance(rateForm.values.inputCurrency, rateForm.values.inputAmount);

  const valid = !(rateForm.loading || rateForm.errors);
  const errors = rateForm.errors;

  const submit = useCallback(() => {
    if(!valid) return;
    onSubmit(tradeRequest);
  }, [valid, tradeRequest, onSubmit]);

  const approve = useCallback(() => {
    approveAllowance()
      .catch(error => {
        if(error.message === 'user-rejected-transaction') return;
        else {
          logError('approve-error', error);
        }
      })
  }, [approveAllowance]);

  let button: any = null;
  if(walletStatus === WalletStatus.CONNECTED) {
    if(allowanceMining) {
      button = <RoundButton wide icon={<LoadingRing/>} label={"Unlocking tokens"} disabled />;
    } else if(rateForm.loading) {
      button = <RoundButton wide icon={<LoadingRing/>} label={"Loading rates"} disabled />;
    } else if(!valid) {
      button = <RoundButton wide icon={<IconRefresh/>} label="Exchange"  disabled />;
    } else if(allowanceLoading) {
      button = <RoundButton wide icon={<LoadingRing/>} label={"Checking allowance"} disabled />;
    } else if(!allowanceReady) {
      button = <RoundButton mode="positive" onClick={approve} wide icon={<IconCoin/>} label="Unlock token" disabled={!valid} />
    } else {
      button = <RoundButton mode="strong" onClick={submit} wide icon={<IconRefresh/>} label="Exchange" disabled={!valid} />
    }
  } else if(walletStatus === WalletStatus.DISCONNECTED) {
    button = <RoundButton mode="positive" onClick={() => dispatch(login())} wide icon={<IconEthereum/>} label="Connect wallet" />
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

      <Box mt={2}>
        {button}
      </Box>

      <Box className={classes.additionalInfo}>
        {rateForm.loading ?
          <LoadingRing mode="half-circle"/>
          :
          (!errors && <RateAmount multiTradeEstimation={multiTradeEstimation}/>)
        }

        {!rateForm.loading && errors &&
        Object.entries(errors).map(([key, _]) =>
          <InvalidMessage key={key}>
            {key === 'lowBalance' && 'You do not have enough funds'}
            {key === 'lowAmount' && `Minimum amount is ${errors[key]} ${rateForm.values.outputCurrency}`}
            {key === 'highAmount' && `Maximum amount is ${config.maxOutputAmount} ${rateForm.values.outputCurrency}`}
            {key === 'lowLiquidity' && `There is not enough liquidity for this pair to trade. Please try with another currency.`}
            {key === 'zeroAmount' && `Amount can't be zero`}
            {key === 'failed' && `Impossible to fetch rates. Please try with different amounts.`}
          </InvalidMessage>
        )}
      </Box>
    </>
  );
}

export default RateForm;
